import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { architectureModules, backtests as fallbackBacktests, dashboardSummary as fallbackSummary, hotMatches as fallbackMatches, oddsAlerts as fallbackAlerts, teams as fallbackTeams, topPredictions as fallbackPredictions } from "@/lib/demo-data";
import type { MatchDetailView, MatchRow, OddsAlert, PredictionCardData } from "@/lib/types";
import { analyzeThreeWayOdds } from "@/lib/server/odds-engine";
import { runPredictionEngine } from "@/lib/server/prediction-engine";

type SummaryCardData = typeof fallbackSummary;

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatConfidence(value: number) {
  if (value >= 0.72) return "High confidence";
  if (value >= 0.55) return "Medium confidence";
  return "Low confidence";
}

function mapStrength(value?: number | null) {
  if (value == null) return "Unknown";
  if (value >= 88) return "Elite";
  if (value >= 78) return "Strong";
  if (value >= 68) return "Stable";
  return "Weak";
}

function mapLoad(value?: number | null) {
  if (value == null) return "Unknown";
  if (value >= 0.72) return "High";
  if (value >= 0.4) return "Moderate";
  return "Low";
}

function formatDateTime(value: Date) {
  return `${value.toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

function formatNumber(value?: number | null, digits = 1) {
  if (value == null) return "-";
  return value.toFixed(digits);
}

function statusToMomentum(status: string) {
  if (status === "LIVE") return "In-play pressure";
  if (status === "FINISHED") return "Closed result state";
  if (status === "POSTPONED" || status === "CANCELED") return "Schedule disruption";
  return "Pre-match setup";
}

export async function getDashboardSummary(): Promise<SummaryCardData> {
  if (!hasDatabaseUrl()) return fallbackSummary;
  try {
    const [competitionCount, sourceCount, predictionCount, highAlerts] = await Promise.all([
      prisma.competition.count(),
      prisma.oddsSource.count(),
      prisma.matchPrediction.count(),
      prisma.alert.count({ where: { severity: { in: ["HIGH", "CRITICAL"] } } })
    ]);

    return [
      { label: "Tracked competitions", value: String(competitionCount), detail: "Domestic leagues, cups, continental and national team tournaments.", tone: "accent" as const },
      { label: "Live market feeds", value: String(sourceCount), detail: "Integrated odds sources with change tracking and consensus normalization.", tone: "default" as const },
      { label: "Prediction rows", value: String(predictionCount), detail: "Stored model outputs with explainable feature snapshots and score probabilities.", tone: "warning" as const },
      { label: "High severity alerts", value: String(highAlerts), detail: "Active market or model anomalies requiring operator review.", tone: "danger" as const }
    ];
  } catch {
    return fallbackSummary;
  }
}

export async function getHotMatches(): Promise<MatchRow[]> {
  if (!hasDatabaseUrl()) return fallbackMatches;
  try {
    const matches = await prisma.match.findMany({
      orderBy: { kickoffAt: "asc" },
      take: 8,
      include: {
        season: { include: { competition: true } },
        homeTeam: true,
        awayTeam: true,
        predictions: { orderBy: { generatedAt: "desc" }, take: 1 },
        oddsSnapshots: { orderBy: { recordedAt: "desc" }, take: 1 }
      }
    });

    if (!matches.length) return fallbackMatches;

    return matches.map((match) => {
      const prediction = match.predictions[0];
      const market = match.oddsSnapshots[0];
      return {
        id: match.id,
        kickoff: `${match.kickoffAt.toISOString().replace("T", " ").slice(0, 16)} UTC`,
        competition: match.season.competition.name,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        context: `${match.roundName ?? "Scheduled fixture"}${match.venue ? ` · ${match.venue}` : ""}`,
        marketLean: market ? `${market.marketType}${market.line ? ` ${market.line}` : ""}` : "Market feed pending",
        modelLean: prediction
          ? `Home ${formatPercent(prediction.homeWinProbability)} / Draw ${formatPercent(prediction.drawProbability)} / Away ${formatPercent(prediction.awayWinProbability)}`
          : "Prediction pending",
        risk: prediction?.riskLabel ?? "Pending"
      };
    });
  } catch {
    return fallbackMatches;
  }
}

export async function getOddsAlerts(): Promise<OddsAlert[]> {
  if (!hasDatabaseUrl()) return fallbackAlerts;
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { match: { include: { homeTeam: true, awayTeam: true } } }
    });
    if (!alerts.length) return fallbackAlerts;
    return alerts.map((alert) => ({
      id: alert.id,
      match: `${alert.match.homeTeam.name} vs ${alert.match.awayTeam.name}`,
      market: alert.category,
      timestamp: alert.createdAt.toISOString(),
      severity: alert.severity,
      message: alert.message,
      state: alert.state
    }));
  } catch {
    return fallbackAlerts;
  }
}

export async function getTopPredictions(): Promise<PredictionCardData[]> {
  if (!hasDatabaseUrl()) return fallbackPredictions;
  try {
    const predictions = await prisma.matchPrediction.findMany({
      orderBy: [{ confidenceScore: "desc" }, { generatedAt: "desc" }],
      take: 6,
      include: {
        match: {
          include: {
            season: { include: { competition: true } },
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });
    if (!predictions.length) return fallbackPredictions;
    return predictions.map((prediction) => ({
      matchId: prediction.matchId,
      competition: prediction.match.season.competition.name,
      match: `${prediction.match.homeTeam.name} vs ${prediction.match.awayTeam.name}`,
      confidence: formatConfidence(prediction.confidenceScore),
      homeWin: formatPercent(prediction.homeWinProbability),
      draw: formatPercent(prediction.drawProbability),
      awayWin: formatPercent(prediction.awayWinProbability),
      scoreline: prediction.recommendedScoreline,
      explanation: prediction.summary
    }));
  } catch {
    return fallbackPredictions;
  }
}

export async function getTeams() {
  if (!hasDatabaseUrl()) return fallbackTeams;
  try {
    const teams = await prisma.team.findMany({
      orderBy: [{ ratingOverall: "desc" }, { name: "asc" }],
      take: 24,
      include: {
        homeMatches: { take: 1, include: { season: { include: { competition: true } } } },
        teamRatings: { orderBy: { capturedAt: "desc" }, take: 1 }
      }
    });
    if (!teams.length) return fallbackTeams;
    return teams.map((team) => {
      const snapshot = team.teamRatings[0];
      return {
        name: team.name,
        competition: team.homeMatches[0]?.season.competition.name ?? "Mixed Competitions",
        rating: team.ratingOverall?.toFixed(1) ?? snapshot?.elo?.toFixed(1) ?? "N/A",
        attack: mapStrength(snapshot?.attack ?? team.ratingAttack),
        defense: mapStrength(snapshot?.defense ?? team.ratingDefense),
        scheduleLoad: mapLoad(snapshot?.scheduleLoad),
        injuryImpact: mapLoad(snapshot?.injuryImpact)
      };
    });
  } catch {
    return fallbackTeams;
  }
}

export async function getBacktests() {
  if (!hasDatabaseUrl()) return fallbackBacktests;
  try {
    const rows = await prisma.backtestResult.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { modelVersion: true }
    });
    if (!rows.length) return fallbackBacktests;
    return rows.map((row) => ({
      model: row.modelVersion.code,
      competition: row.competition,
      accuracy: `${row.accuracy.toFixed(1)}%`,
      logLoss: row.logLoss.toFixed(3),
      roi: `${row.roi >= 0 ? "+" : ""}${row.roi.toFixed(1)}%`
    }));
  } catch {
    return fallbackBacktests;
  }
}

export function getArchitectureModules() {
  return architectureModules;
}

export async function getMatchDetail(matchId: string): Promise<MatchDetailView | null> {
  if (!hasDatabaseUrl()) {
    const fallbackMatch = fallbackMatches.find((match) => match.id === matchId) ?? fallbackMatches[0];
    const fallbackPrediction = fallbackPredictions.find((prediction) => prediction.matchId === fallbackMatch.id) ?? fallbackPredictions[0];
      return {
        id: fallbackMatch.id,
        competition: fallbackMatch.competition,
        roundName: "Demo Fixture",
        kickoff: fallbackMatch.kickoff,
        venue: "Demo Venue",
        homeTeam: fallbackMatch.home,
        awayTeam: fallbackMatch.away,
        status: "SCHEDULED",
        momentumTag: "Pre-match setup",
        expectedGoals: { home: 1.6, away: 1.1 },
        score: { home: null, away: null },
        restAdvantage: "Balanced",
        travelContext: "Travel load not persisted in fallback mode.",
        marketOverview: fallbackMatch.marketLean,
        operationalNotes: [
          "Fallback detail is generated from demo cards rather than persisted granular feeds.",
          "Lineup, event and operator states should be treated as illustrative only."
        ],
        predictionOverview: {
          homeWin: fallbackPrediction.homeWin,
          draw: fallbackPrediction.draw,
        awayWin: fallbackPrediction.awayWin,
        scoreline: fallbackPrediction.scoreline,
        risk: fallbackMatch.risk,
        confidence: fallbackPrediction.confidence,
        explanation: fallbackPrediction.explanation
      },
      lineupSummary: {
        home: ["Demo Starter 1", "Demo Starter 2", "Demo Starter 3"],
        away: ["Demo Starter A", "Demo Starter B", "Demo Starter C"],
        homeFormation: "4-3-3",
          awayFormation: "4-2-3-1",
          confirmed: false
        },
        keyPlayers: {
          home: ["Demo Creator", "Demo Finisher"],
          away: ["Demo Counter Runner", "Demo Deep Midfielder"]
        },
        formGuide: {
          home: "W-W-D-W",
          away: "D-L-W-D"
        },
        statSnapshot: [
          { label: "Possession", home: "58%", away: "42%" },
          { label: "Shots", home: "14", away: "9" },
          { label: "Danger Attacks", home: "48", away: "31" }
        ],
        marketSnapshot: {
          source: "Demo Feed",
          marketType: "ONE_X_TWO",
        line: "-",
        overround: "N/A"
      },
      modelVsMarket: {
        modelHome: fallbackPrediction.homeWin,
        marketHome: "55%",
        modelDraw: fallbackPrediction.draw,
        marketDraw: "24%",
        modelAway: fallbackPrediction.awayWin,
          marketAway: "21%",
          valueLean: "Model and market broadly aligned with modest home-edge support."
        },
        recentEvents: [
          { minute: "12'", team: fallbackMatch.home, type: "pressure", detail: "Home side forcing early territorial control." },
          { minute: "34'", team: fallbackMatch.away, type: "transition", detail: "Away side creates its best direct attack in space." }
        ],
        alertSummary: [
          { severity: "MEDIUM", category: "Market drift", state: "OPEN", message: "Illustrative fallback alert for operator review." }
        ],
        tacticalSummary: [
          "Home side expected to dominate territorial control and central progression.",
          "Away side projects better in direct transition than in settled possession.",
        "Rest profile does not create a major fatigue imbalance."
      ]
    };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        season: { include: { competition: true } },
        homeTeam: { include: { teamRatings: { orderBy: { capturedAt: "desc" }, take: 1 } } },
        awayTeam: { include: { teamRatings: { orderBy: { capturedAt: "desc" }, take: 1 } } },
        stats: true,
        events: { orderBy: [{ minute: "desc" }], take: 6 },
        alerts: { orderBy: [{ createdAt: "desc" }], take: 5 },
        lineups: true,
        predictions: { orderBy: { generatedAt: "desc" }, take: 1 },
        oddsSnapshots: { orderBy: { recordedAt: "desc" }, take: 1, include: { source: true } }
      }
    });

    if (!match) return null;

    const latestPrediction = match.predictions[0];
    const latestOdds = match.oddsSnapshots[0];
    const homeLineup = match.lineups.find((lineup) => lineup.teamId === match.homeTeamId);
    const awayLineup = match.lineups.find((lineup) => lineup.teamId === match.awayTeamId);
    const oddsAnalysis = analyzeThreeWayOdds({
      homeOdds: latestOdds?.homeOdds,
      drawOdds: latestOdds?.drawOdds,
      awayOdds: latestOdds?.awayOdds
    });

    const generatedPrediction = runPredictionEngine({
      homeRating: match.homeTeam.ratingOverall ?? match.homeTeam.teamRatings[0]?.elo ?? 75,
      awayRating: match.awayTeam.ratingOverall ?? match.awayTeam.teamRatings[0]?.elo ?? 75,
      expectedHomeGoals: match.expectedHomeGoals ?? 1.2,
      expectedAwayGoals: match.expectedAwayGoals ?? 1.0,
      homeRestDays: match.restDaysHome,
      awayRestDays: match.restDaysAway,
      marketHomeProbability: oddsAnalysis.impliedHome ?? undefined,
      marketDrawProbability: oddsAnalysis.impliedDraw ?? undefined,
      marketAwayProbability: oddsAnalysis.impliedAway ?? undefined
    });

    const prediction = latestPrediction ?? generatedPrediction;
    const confidence = "confidenceScore" in prediction
      ? prediction.confidenceScore >= 0.72
        ? "High confidence"
        : prediction.confidenceScore >= 0.55
          ? "Medium confidence"
          : "Low confidence"
      : "Medium confidence";

    const homeWin = "homeWinProbability" in prediction ? formatPercent(prediction.homeWinProbability) : "N/A";
    const draw = "drawProbability" in prediction ? formatPercent(prediction.drawProbability) : "N/A";
    const awayWin = "awayWinProbability" in prediction ? formatPercent(prediction.awayWinProbability) : "N/A";
    const marketHome = oddsAnalysis.impliedHome != null ? formatPercent(oddsAnalysis.impliedHome) : "N/A";
    const marketDraw = oddsAnalysis.impliedDraw != null ? formatPercent(oddsAnalysis.impliedDraw) : "N/A";
    const marketAway = oddsAnalysis.impliedAway != null ? formatPercent(oddsAnalysis.impliedAway) : "N/A";
    const homeSnapshot = match.homeTeam.teamRatings[0];
    const awaySnapshot = match.awayTeam.teamRatings[0];
    const homeLineupPlayers = Array.isArray(homeLineup?.snapshot) ? homeLineup.snapshot.map((item) => String(item)) : [match.homeTeam.name + " projected XI pending official confirmation"];
    const awayLineupPlayers = Array.isArray(awayLineup?.snapshot) ? awayLineup.snapshot.map((item) => String(item)) : [match.awayTeam.name + " projected XI pending official confirmation"];

    return {
      id: match.id,
      competition: match.season.competition.name,
      roundName: match.roundName ?? "Scheduled fixture",
      kickoff: formatDateTime(match.kickoffAt),
      venue: match.venue ?? "TBD",
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      status: match.status,
      momentumTag: statusToMomentum(match.status),
      expectedGoals: {
        home: match.expectedHomeGoals,
        away: match.expectedAwayGoals
      },
      score: {
        home: match.homeScore,
        away: match.awayScore
      },
      restAdvantage:
        (match.restDaysHome ?? 0) > (match.restDaysAway ?? 0)
          ? `${match.homeTeam.name} +${(match.restDaysHome ?? 0) - (match.restDaysAway ?? 0)} days`
          : (match.restDaysHome ?? 0) < (match.restDaysAway ?? 0)
            ? `${match.awayTeam.name} +${(match.restDaysAway ?? 0) - (match.restDaysHome ?? 0)} days`
            : "Balanced",
      travelContext:
        match.travelDistanceAway != null
          ? `${match.awayTeam.name} estimated travel: ${match.travelDistanceAway} km.`
          : "Away travel load not available.",
      marketOverview: oddsAnalysis.lean,
      operationalNotes: [
        latestOdds ? `Latest market capture from ${latestOdds.source.name} at ${formatDateTime(latestOdds.recordedAt)}.` : "No stored market snapshot for this fixture.",
        latestPrediction ? `Prediction persisted by model row at ${formatDateTime(latestPrediction.generatedAt)}.` : "Prediction is currently generated on the fly from team strength and pricing inputs.",
        homeLineup?.confirmed || awayLineup?.confirmed ? "At least one lineup is marked confirmed." : "Both lineups remain projected states."
      ],
      predictionOverview: {
        homeWin,
        draw,
        awayWin,
        scoreline: prediction.recommendedScoreline,
        risk: prediction.riskLabel,
        confidence,
        explanation: prediction.summary ?? generatedPrediction.explanation
      },
      lineupSummary: {
        home: homeLineupPlayers,
        away: awayLineupPlayers,
        homeFormation: homeLineup?.formation ?? "4-3-3",
        awayFormation: awayLineup?.formation ?? "4-2-3-1",
        confirmed: Boolean(homeLineup?.confirmed && awayLineup?.confirmed)
      },
      keyPlayers: {
        home: homeLineupPlayers.slice(0, 3),
        away: awayLineupPlayers.slice(0, 3)
      },
      formGuide: {
        home: `${mapStrength(homeSnapshot?.formScore)} form / ${mapLoad(homeSnapshot?.scheduleLoad)} load`,
        away: `${mapStrength(awaySnapshot?.formScore)} form / ${mapLoad(awaySnapshot?.scheduleLoad)} load`
      },
      statSnapshot: [
        { label: "Possession", home: match.stats?.homePossession != null ? `${match.stats.homePossession.toFixed(0)}%` : "-", away: match.stats?.awayPossession != null ? `${match.stats.awayPossession.toFixed(0)}%` : "-" },
        { label: "Shots", home: String(match.stats?.homeShots ?? "-"), away: String(match.stats?.awayShots ?? "-") },
        { label: "Shots On Target", home: String(match.stats?.homeShotsOnTarget ?? "-"), away: String(match.stats?.awayShotsOnTarget ?? "-") },
        { label: "Danger Attacks", home: String(match.stats?.homeDangerAttacks ?? "-"), away: String(match.stats?.awayDangerAttacks ?? "-") }
      ],
      marketSnapshot: {
        source: latestOdds?.source.name ?? "Stored Feed",
        marketType: latestOdds?.marketType ?? "UNKNOWN",
        line: latestOdds?.line ?? "-",
        overround: oddsAnalysis.overround != null ? `${(oddsAnalysis.overround * 100).toFixed(2)}%` : "N/A"
      },
      modelVsMarket: {
        modelHome: homeWin,
        marketHome,
        modelDraw: draw,
        marketDraw,
        modelAway: awayWin,
        marketAway,
        valueLean:
          oddsAnalysis.impliedHome != null && latestPrediction
            ? latestPrediction.homeWinProbability > oddsAnalysis.impliedHome
              ? `${match.homeTeam.name} model edge over market baseline.`
              : `${match.awayTeam.name} or draw side more supported by market pricing.`
            : "Insufficient price depth for edge comparison."
      },
      recentEvents: match.events.map((event) => ({
        minute: `${event.minute}'`,
        team: event.teamId === match.homeTeamId ? match.homeTeam.name : event.teamId === match.awayTeamId ? match.awayTeam.name : "Match",
        type: event.eventType,
        detail: event.detail ?? event.playerName ?? "No additional detail"
      })),
      alertSummary: match.alerts.map((alert) => ({
        severity: alert.severity,
        category: alert.category,
        state: alert.state,
        message: alert.message
      })),
      tacticalSummary: [
        `${match.homeTeam.name} projects ${match.expectedHomeGoals ?? 0} expected goals versus ${match.awayTeam.name}'s ${match.expectedAwayGoals ?? 0}.`,
        `Rest advantage currently reads: ${
          (match.restDaysHome ?? 0) > (match.restDaysAway ?? 0)
            ? match.homeTeam.name
            : (match.restDaysHome ?? 0) < (match.restDaysAway ?? 0)
              ? match.awayTeam.name
              : "balanced"
        }.`,
        `Latest market interpretation: ${oddsAnalysis.lean}.`,
        `${match.homeTeam.name} rating ${formatNumber(match.homeTeam.ratingOverall)} vs ${match.awayTeam.name} rating ${formatNumber(match.awayTeam.ratingOverall)}.`
      ]
    };
  } catch {
    return null;
  }
}
