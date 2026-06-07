const { PrismaClient, CompetitionType, MatchStatus, MarketType, AlertSeverity, FeedStatus, JobRunStatus, AlertState } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.scoreProbability.deleteMany();
  await prisma.matchPrediction.deleteMany();
  await prisma.backtestResult.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.oddsSnapshot.deleteMany();
  await prisma.lineup.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.matchStat.deleteMany();
  await prisma.match.deleteMany();
  await prisma.teamRatingSnapshot.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.player.deleteMany();
  await prisma.season.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.team.deleteMany();
  await prisma.feedSourceConfig.deleteMany();
  await prisma.jobRun.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.oddsSource.deleteMany();
  await prisma.modelVersion.deleteMany();

  const competitions = await Promise.all([
    prisma.competition.create({ data: { name: "World Cup", slug: "world-cup", type: CompetitionType.INTERNATIONAL } }),
    prisma.competition.create({ data: { name: "Premier League", slug: "premier-league", country: "England", type: CompetitionType.LEAGUE } }),
    prisma.competition.create({ data: { name: "UEFA Champions League", slug: "uefa-champions-league", type: CompetitionType.CUP } }),
    prisma.competition.create({ data: { name: "International Friendly", slug: "international-friendly", type: CompetitionType.FRIENDLY } })
  ]);

  const worldCup = competitions[0];
  const premierLeague = competitions[1];
  const championsLeague = competitions[2];
  const friendly = competitions[3];

  const seasons = await Promise.all([
    prisma.season.create({ data: { competitionId: worldCup.id, name: "2026", yearStart: 2026, yearEnd: 2026, current: true } }),
    prisma.season.create({ data: { competitionId: premierLeague.id, name: "2026/27", yearStart: 2026, yearEnd: 2027, current: true } }),
    prisma.season.create({ data: { competitionId: championsLeague.id, name: "2026/27", yearStart: 2026, yearEnd: 2027, current: true } }),
    prisma.season.create({ data: { competitionId: friendly.id, name: "2026", yearStart: 2026, yearEnd: 2026, current: true } })
  ]);

  const teams = await Promise.all([
    prisma.team.create({ data: { name: "Spain", slug: "spain", country: "Spain", ratingOverall: 93.1, ratingAttack: 90.4, ratingDefense: 88.8 } }),
    prisma.team.create({ data: { name: "Japan", slug: "japan", country: "Japan", ratingOverall: 84.8, ratingAttack: 79.4, ratingDefense: 82.2 } }),
    prisma.team.create({ data: { name: "France", slug: "france", country: "France", ratingOverall: 92.8, ratingAttack: 91.7, ratingDefense: 88.4 } }),
    prisma.team.create({ data: { name: "Ivory Coast", slug: "ivory-coast", country: "Ivory Coast", ratingOverall: 79.6, ratingAttack: 76.4, ratingDefense: 74.8 } }),
    prisma.team.create({ data: { name: "Mexico", slug: "mexico", country: "Mexico", ratingOverall: 85.2, ratingAttack: 80.6, ratingDefense: 78.2 } }),
    prisma.team.create({ data: { name: "Serbia", slug: "serbia", country: "Serbia", ratingOverall: 81.4, ratingAttack: 78.8, ratingDefense: 74.9 } }),
    prisma.team.create({ data: { name: "Sweden", slug: "sweden", country: "Sweden", ratingOverall: 80.2, ratingAttack: 75.5, ratingDefense: 77.1 } }),
    prisma.team.create({ data: { name: "Greece", slug: "greece", country: "Greece", ratingOverall: 78.7, ratingAttack: 71.8, ratingDefense: 76.7 } }),
    prisma.team.create({ data: { name: "Manchester City", slug: "manchester-city", country: "England", ratingOverall: 91.7, ratingAttack: 90.1, ratingDefense: 87.3 } }),
    prisma.team.create({ data: { name: "Arsenal", slug: "arsenal", country: "England", ratingOverall: 89.2, ratingAttack: 85.4, ratingDefense: 84.9 } }),
    prisma.team.create({ data: { name: "Bayern Munich", slug: "bayern-munich", country: "Germany", ratingOverall: 89.1, ratingAttack: 87.2, ratingDefense: 83.1 } }),
    prisma.team.create({ data: { name: "PSG", slug: "psg", country: "France", ratingOverall: 88.7, ratingAttack: 86.8, ratingDefense: 81.5 } })
  ]);

  const bySlug = Object.fromEntries(teams.map((team) => [team.slug, team]));

  const modelVersion = await prisma.modelVersion.create({
    data: {
      code: "ensemble-v1.3",
      description: "Ensemble baseline using ratings, form, market priors and schedule stress."
    }
  });

  const source365 = await prisma.oddsSource.create({ data: { name: "Bet365", region: "Global" } });
  const sourcePinnacle = await prisma.oddsSource.create({ data: { name: "Pinnacle", region: "Global" } });

  await prisma.feedSourceConfig.createMany({
    data: [
      {
        sourceId: source365.id,
        code: "fixtures-primary",
        label: "Primary fixtures feed",
        category: "fixtures",
        mode: "api",
        cadence: "15m pre-match / 30s in-play",
        status: FeedStatus.ACTIVE,
        notes: "Canonical fixtures, scores, competition metadata and venues."
      },
      {
        sourceId: sourcePinnacle.id,
        code: "odds-aggregator",
        label: "Odds aggregator",
        category: "odds",
        mode: "api",
        cadence: "5m pre-match / 15s in-play",
        status: FeedStatus.ACTIVE,
        notes: "Primary consensus builder for 1X2, totals and handicap drift."
      },
      {
        code: "lineups-scraper",
        label: "Lineup monitor",
        category: "lineups",
        mode: "scraper",
        cadence: "60m to kickoff / 5m final hour",
        status: FeedStatus.ACTIVE,
        notes: "Official lineups, late scratches and formation confirmations."
      },
      {
        code: "ratings-provider",
        label: "Ratings and rankings provider",
        category: "rankings",
        mode: "manual",
        cadence: "Daily",
        status: FeedStatus.FALLBACK,
        notes: "External Elo/FIFA baselines used when proprietary ratings are stale."
      },
      {
        code: "news-monitor",
        label: "News and press conference monitor",
        category: "news",
        mode: "scraper",
        cadence: "30m",
        status: FeedStatus.PLANNED,
        notes: "Context feed for injuries, tactical hints and manager comments."
      }
    ]
  });

  const [worldCupSeason, premierSeason, clSeason, friendlySeason] = seasons;

  const matches = await Promise.all([
    prisma.match.create({
      data: {
        seasonId: worldCupSeason.id,
        homeTeamId: bySlug["spain"].id,
        awayTeamId: bySlug["japan"].id,
        roundName: "Group Stage",
        venue: "Seattle Field",
        kickoffAt: new Date("2026-06-07T21:00:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 1.88,
        expectedAwayGoals: 0.81,
        restDaysHome: 5,
        restDaysAway: 4,
        travelDistanceAway: 6120
      }
    }),
    prisma.match.create({
      data: {
        seasonId: friendlySeason.id,
        homeTeamId: bySlug["france"].id,
        awayTeamId: bySlug["ivory-coast"].id,
        roundName: "International Friendly",
        venue: "Nantes",
        kickoffAt: new Date("2026-06-05T03:10:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 2.02,
        expectedAwayGoals: 0.79,
        restDaysHome: 6,
        restDaysAway: 5,
        travelDistanceAway: 4180
      }
    }),
    prisma.match.create({
      data: {
        seasonId: friendlySeason.id,
        homeTeamId: bySlug["mexico"].id,
        awayTeamId: bySlug["serbia"].id,
        roundName: "International Friendly",
        venue: "Toluca",
        kickoffAt: new Date("2026-06-05T10:00:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 1.74,
        expectedAwayGoals: 0.97,
        restDaysHome: 7,
        restDaysAway: 4,
        travelDistanceAway: 10450
      }
    }),
    prisma.match.create({
      data: {
        seasonId: friendlySeason.id,
        homeTeamId: bySlug["sweden"].id,
        awayTeamId: bySlug["greece"].id,
        roundName: "International Friendly",
        venue: "Stockholm",
        kickoffAt: new Date("2026-06-05T01:00:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 1.21,
        expectedAwayGoals: 0.89,
        restDaysHome: 5,
        restDaysAway: 5,
        travelDistanceAway: 2560
      }
    }),
    prisma.match.create({
      data: {
        seasonId: premierSeason.id,
        homeTeamId: bySlug["manchester-city"].id,
        awayTeamId: bySlug["arsenal"].id,
        roundName: "Matchday 3",
        venue: "Etihad Stadium",
        kickoffAt: new Date("2026-06-06T19:30:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 1.62,
        expectedAwayGoals: 1.21,
        restDaysHome: 3,
        restDaysAway: 3,
        travelDistanceAway: 300
      }
    }),
    prisma.match.create({
      data: {
        seasonId: clSeason.id,
        homeTeamId: bySlug["bayern-munich"].id,
        awayTeamId: bySlug["psg"].id,
        roundName: "Quarter-final",
        venue: "Munich Arena",
        kickoffAt: new Date("2026-06-09T20:00:00.000Z"),
        status: MatchStatus.SCHEDULED,
        expectedHomeGoals: 1.48,
        expectedAwayGoals: 1.41,
        restDaysHome: 4,
        restDaysAway: 4,
        travelDistanceAway: 850
      }
    })
  ]);

  for (const team of teams) {
    await prisma.teamRatingSnapshot.create({
      data: {
        teamId: team.id,
        capturedAt: new Date(),
        elo: team.ratingOverall,
        attack: team.ratingAttack,
        defense: team.ratingDefense,
        formScore: Math.max(55, Math.min(95, (team.ratingOverall || 75) - 5)),
        injuryImpact: team.slug === "ivory-coast" || team.slug === "serbia" ? 0.42 : 0.24,
        scheduleLoad: team.slug === "manchester-city" || team.slug === "arsenal" ? 0.78 : 0.38
      }
    });
  }

  const now = Date.now();
  await prisma.jobRun.createMany({
    data: [
      {
        name: "sync_fixtures",
        stage: "ingestion",
        status: JobRunStatus.COMPLETED,
        processed: 18,
        written: 18,
        skipped: 0,
        startedAt: new Date(now - 55 * 60 * 1000),
        finishedAt: new Date(now - 52 * 60 * 1000),
        note: "Fixtures upserted for current competitions and demo IDs aligned."
      },
      {
        name: "sync_odds",
        stage: "ingestion",
        status: JobRunStatus.RUNNING,
        processed: 124,
        written: 118,
        skipped: 6,
        startedAt: new Date(now - 6 * 60 * 1000),
        note: "Live price refresh still processing slower books."
      },
      {
        name: "sync_lineups",
        stage: "ingestion",
        status: JobRunStatus.COMPLETED,
        processed: 6,
        written: 6,
        skipped: 0,
        startedAt: new Date(now - 90 * 60 * 1000),
        finishedAt: new Date(now - 86 * 60 * 1000),
        note: "Projected lineups refreshed from official federation feeds."
      },
      {
        name: "sync_rankings",
        stage: "processing",
        status: JobRunStatus.FAILED,
        processed: 12,
        written: 0,
        skipped: 12,
        startedAt: new Date(now - 3 * 60 * 60 * 1000),
        finishedAt: new Date(now - 175 * 60 * 1000),
        note: "Fallback ranking import failed after stale upstream checksum."
      },
      {
        name: "sync_news",
        stage: "processing",
        status: JobRunStatus.QUEUED,
        processed: 0,
        written: 0,
        skipped: 0,
        startedAt: new Date(now - 15 * 60 * 1000),
        note: "Queued behind lineup normalization."
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actor: "operator",
        action: "LOGIN",
        entityType: "session",
        metadata: { summary: "Operator signed in to review overnight changes.", ip: "127.0.0.1", userAgent: "seed-browser", path: "/login" }
      },
      {
        actor: "operator",
        action: "LOGIN_FAILED",
        entityType: "session",
        metadata: { summary: "Failed operator login attempt for stale credentials.", ip: "127.0.0.1", userAgent: "seed-browser", path: "/api/auth/login" }
      },
      {
        actor: "anonymous",
        action: "UNAUTHORIZED_ACCESS",
        entityType: "operator-api",
        entityId: "/api/operator/jobs/run",
        metadata: { summary: "Unauthorized attempt to trigger operator job execution.", ip: "10.0.0.18", userAgent: "curl/8.0", path: "/api/operator/jobs/run" }
      },
      {
        actor: "operator",
        action: "SOURCE_DISABLED",
        entityType: "feed-source",
        entityId: "news-monitor",
        metadata: { summary: "News monitor disabled after duplicate press conference ingestion.", ip: "127.0.0.1", userAgent: "seed-browser", path: "/api/operator/sources/news-monitor" }
      },
      {
        actor: "operator",
        action: "JOB_RUN_COMPLETED",
        entityType: "job-run",
        entityId: "sync_fixtures",
        metadata: { summary: "sync_fixtures completed and refreshed all tracked competitions.", ip: "127.0.0.1", userAgent: "seed-browser", path: "/api/operator/jobs/run" }
      },
      {
        actor: "operator",
        action: "ALERT_STATE_UPDATED",
        entityType: "alert",
        metadata: { summary: "High-severity France market alert acknowledged by trading ops.", ip: "127.0.0.1", userAgent: "seed-browser", path: "/api/operator/alerts/demo" }
      },
      {
        actor: "unknown",
        action: "LOGIN_RATE_LIMITED",
        entityType: "session",
        metadata: { summary: "Login blocked by rate limiter for unknown user after 5 consecutive failures.", remainingMs: 840000, ip: "192.168.1.55", userAgent: "Mozilla/5.0", path: "/api/auth/login" }
      }
    ]
  });

  const predictionPayloads = [
    { match: matches[0], probs: [0.58, 0.24, 0.18], score: "2-0", risk: "Medium", summary: "Spain controls midfield territory and enters with superior squad depth, but Japan transition speed keeps variance alive." },
    { match: matches[1], probs: [0.61, 0.23, 0.16], score: "2-0", risk: "Low", summary: "France rates clearly higher in attack and market confirmation supports the stronger home edge with minimal injury drag." },
    { match: matches[2], probs: [0.54, 0.26, 0.20], score: "2-1", risk: "Medium", summary: "Mexico benefits from home conditions and altitude while Serbia still profiles as dangerous on restarts and direct attacks." },
    { match: matches[3], probs: [0.4, 0.33, 0.27], score: "1-1", risk: "High", summary: "Sweden holds mild home edge, but Greece limits event volume and the handicap market suggests low conviction on a clear home margin." },
    { match: matches[4], probs: [0.44, 0.27, 0.29], score: "2-1", risk: "High", summary: "City rates slightly stronger overall, though Arsenal's defensive stability prevents a heavy favorite profile." },
    { match: matches[5], probs: [0.36, 0.26, 0.38], score: "1-2", risk: "Medium", summary: "This knockout tie shows the tightest distribution, with PSG retaining the sharper transition ceiling against Bayern's territorial edge." }
  ];

  for (const entry of predictionPayloads) {
    const prediction = await prisma.matchPrediction.create({
      data: {
        matchId: entry.match.id,
        modelVersionId: modelVersion.id,
        generatedAt: new Date(),
        homeWinProbability: entry.probs[0],
        drawProbability: entry.probs[1],
        awayWinProbability: entry.probs[2],
        over25Probability: Math.min(0.8, entry.probs[0] + entry.probs[2]),
        under25Probability: 0.38,
        recommendedScoreline: entry.score,
        confidenceScore: Math.max(...entry.probs),
        riskLabel: entry.risk,
        summary: entry.summary,
        featureSnapshot: {
          formEdge: entry.probs[0] - entry.probs[2],
          scheduleStress: entry.match.restDaysAway,
          marketSupport: entry.risk === "Low" ? "aligned" : "mixed"
        }
      }
    });

    const [homeGoals, awayGoals] = entry.score.split("-").map((value) => Number(value));
    await prisma.scoreProbability.createMany({
      data: [
        { predictionId: prediction.id, homeGoals, awayGoals, probability: 0.18 },
        { predictionId: prediction.id, homeGoals: Math.max(0, homeGoals - 1), awayGoals, probability: 0.14 },
        { predictionId: prediction.id, homeGoals, awayGoals: Math.max(0, awayGoals - 1), probability: 0.11 }
      ]
    });
  }

  await prisma.matchStat.createMany({
    data: [
      { matchId: matches[0].id, homePossession: 60, awayPossession: 40, homeShots: 15, awayShots: 8, homeShotsOnTarget: 6, awayShotsOnTarget: 3, homeCorners: 7, awayCorners: 2, homeDangerAttacks: 54, awayDangerAttacks: 29 },
      { matchId: matches[1].id, homePossession: 63, awayPossession: 37, homeShots: 17, awayShots: 7, homeShotsOnTarget: 8, awayShotsOnTarget: 2, homeCorners: 6, awayCorners: 3, homeDangerAttacks: 61, awayDangerAttacks: 21 },
      { matchId: matches[4].id, homePossession: 56, awayPossession: 44, homeShots: 14, awayShots: 11, homeShotsOnTarget: 5, awayShotsOnTarget: 4, homeCorners: 5, awayCorners: 4, homeDangerAttacks: 48, awayDangerAttacks: 41 },
      { matchId: matches[5].id, homePossession: 52, awayPossession: 48, homeShots: 13, awayShots: 12, homeShotsOnTarget: 4, awayShotsOnTarget: 5, homeCorners: 4, awayCorners: 6, homeDangerAttacks: 44, awayDangerAttacks: 46 }
    ]
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: matches[1].id, minute: 14, teamId: bySlug["france"].id, playerName: "Kylian Mbappe", eventType: "shot", detail: "Cuts inside and forces an early save from the edge of the box." },
      { matchId: matches[1].id, minute: 38, teamId: bySlug["ivory-coast"].id, playerName: "Simon Adingra", eventType: "counter", detail: "Fast transition exposes the far-side channel but the final pass drifts long." },
      { matchId: matches[4].id, minute: 27, teamId: bySlug["manchester-city"].id, playerName: "Erling Haaland", eventType: "goal", detail: "Near-post finish after a third-man run opens Arsenal's rest defense." },
      { matchId: matches[4].id, minute: 63, teamId: bySlug["arsenal"].id, playerName: "Bukayo Saka", eventType: "chance", detail: "Back-post isolation creates Arsenal's cleanest look of the half." },
      { matchId: matches[5].id, minute: 51, teamId: bySlug["psg"].id, playerName: "Ousmane Dembele", eventType: "transition", detail: "Acceleration in open field creates a high-leverage cutback chance." }
    ]
  });

  await prisma.lineup.createMany({
    data: [
      {
        matchId: matches[0].id,
        teamId: bySlug["spain"].id,
        formation: "4-3-3",
        confirmed: false,
        snapshot: ["Unai Simon", "Carvajal", "Le Normand", "Laporte", "Cucurella", "Rodri", "Pedri", "Merino", "Lamine Yamal", "Morata", "Nico Williams"]
      },
      {
        matchId: matches[0].id,
        teamId: bySlug["japan"].id,
        formation: "4-2-3-1",
        confirmed: false,
        snapshot: ["Suzuki", "Sugawara", "Tomiyasu", "Itakura", "Ito", "Endo", "Morita", "Kubo", "Kamada", "Mitoma", "Ueda"]
      },
      {
        matchId: matches[4].id,
        teamId: bySlug["manchester-city"].id,
        formation: "3-2-4-1",
        confirmed: true,
        snapshot: ["Ederson", "Dias", "Stones", "Gvardiol", "Rodri", "Kovacic", "Foden", "De Bruyne", "Bernardo", "Doku", "Haaland"]
      },
      {
        matchId: matches[4].id,
        teamId: bySlug["arsenal"].id,
        formation: "4-3-3",
        confirmed: true,
        snapshot: ["Raya", "White", "Saliba", "Gabriel", "Timber", "Rice", "Odegaard", "Havertz", "Saka", "Jesus", "Martinelli"]
      },
      {
        matchId: matches[5].id,
        teamId: bySlug["bayern-munich"].id,
        formation: "4-2-3-1",
        confirmed: false,
        snapshot: ["Neuer", "Kimmich", "Upamecano", "Kim", "Davies", "Goretzka", "Pavlovic", "Sane", "Musiala", "Coman", "Kane"]
      },
      {
        matchId: matches[5].id,
        teamId: bySlug["psg"].id,
        formation: "4-3-3",
        confirmed: false,
        snapshot: ["Donnarumma", "Hakimi", "Marquinhos", "Skriniar", "Nuno Mendes", "Vitinha", "Ugarte", "Zaire-Emery", "Dembele", "Ramos", "Barcola"]
      }
    ]
  });

  const oddsPayloads = [
    [matches[1], source365, MarketType.ONE_X_TWO, null, 1.17, 5.56, 10.5],
    [matches[2], source365, MarketType.ONE_X_TWO, null, 1.2, 5.15, 9.8],
    [matches[3], source365, MarketType.ONE_X_TWO, null, 1.86, 3.15, 3.65],
    [matches[4], sourcePinnacle, MarketType.ASIAN_HANDICAP, "-0.25", 1.93, null, 1.99],
    [matches[5], sourcePinnacle, MarketType.BOTH_TEAMS_TO_SCORE, null, 1.83, null, 1.92]
  ];

  for (const [match, source, marketType, line, homeOdds, drawOdds, awayOdds] of oddsPayloads) {
    await prisma.oddsSnapshot.create({
      data: {
        matchId: match.id,
        sourceId: source.id,
        marketType,
        line,
        homeOdds,
        drawOdds,
        awayOdds,
        impliedHome: homeOdds ? 1 / homeOdds : null,
        impliedDraw: drawOdds ? 1 / drawOdds : null,
        impliedAway: awayOdds ? 1 / awayOdds : null,
        recordedAt: new Date()
      }
    });
  }

  await prisma.alert.createMany({
    data: [
      {
        matchId: matches[3].id,
        severity: AlertSeverity.MEDIUM,
        category: "Asian Handicap -1",
        state: AlertState.OPEN,
        message: "Public side is leaning Sweden, but sharp protection on Greece keeps the handicap from fully breaking."
      },
      {
        matchId: matches[1].id,
        severity: AlertSeverity.HIGH,
        category: "1X2 / Handicap",
        state: AlertState.ACKNOWLEDGED,
        message: "France home win is shortening across major books while lineup data confirms a first-choice front line."
      },
      {
        matchId: matches[2].id,
        severity: AlertSeverity.LOW,
        category: "Over/Under 2.5",
        state: AlertState.RESOLVED,
        message: "Total market remains stable, but under price is drifting after weather downgrade and slower pitch expectations."
      },
      {
        matchId: matches[4].id,
        severity: AlertSeverity.CRITICAL,
        category: "Line movement / model divergence",
        state: AlertState.OPEN,
        message: "City pricing has shortened despite balanced rest profile, leaving a sharper disagreement with the model's draw band."
      }
    ]
  });

  await prisma.backtestResult.createMany({
    data: [
      { modelVersionId: modelVersion.id, competition: "Premier League", accuracy: 54.8, logLoss: 0.962, roi: 6.4, sampleSize: 380 },
      { modelVersionId: modelVersion.id, competition: "LaLiga", accuracy: 53.1, logLoss: 0.987, roi: 3.2, sampleSize: 380 },
      { modelVersionId: modelVersion.id, competition: "Serie A", accuracy: 57.2, logLoss: 0.911, roi: 8.7, sampleSize: 380 },
      { modelVersionId: modelVersion.id, competition: "International", accuracy: 52.0, logLoss: 1.011, roi: 1.5, sampleSize: 120 }
    ]
  });

  await prisma.player.createMany({
    data: [
      { teamId: bySlug["spain"].id, name: "Lamine Yamal", nationality: "Spain", position: "RW", marketValue: 150000000 },
      { teamId: bySlug["france"].id, name: "Kylian Mbappe", nationality: "France", position: "FW", marketValue: 180000000 },
      { teamId: bySlug["mexico"].id, name: "Edson Alvarez", nationality: "Mexico", position: "DM", marketValue: 35000000 },
      { teamId: bySlug["serbia"].id, name: "Dusan Vlahovic", nationality: "Serbia", position: "FW", marketValue: 65000000 },
      { teamId: bySlug["manchester-city"].id, name: "Erling Haaland", nationality: "Norway", position: "FW", marketValue: 180000000 },
      { teamId: bySlug["arsenal"].id, name: "Bukayo Saka", nationality: "England", position: "RW", marketValue: 130000000 }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
