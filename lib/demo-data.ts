import type { MatchRow, OddsAlert, PredictionCardData } from "@/lib/types";

export const dashboardSummary = [
  { label: "Tracked competitions", value: "142", detail: "Domestic leagues, cups, continental and national team tournaments.", tone: "accent" as const },
  { label: "Live market feeds", value: "38", detail: "Integrated odds sources with change tracking and consensus normalization.", tone: "default" as const },
  { label: "Automation jobs", value: "116", detail: "Scheduled ingestion, feature generation, model refresh and alert routing.", tone: "warning" as const },
  { label: "Model drift alerts", value: "3", detail: "Competitions requiring recalibration after recent performance divergence.", tone: "danger" as const }
];

export const hotMatches: MatchRow[] = [
  {
    id: "eng-mci-ars",
    kickoff: "2026-06-06 19:30 UTC",
    competition: "Premier League",
    home: "Manchester City",
    away: "Arsenal",
    context: "Title-race clash with compressed rest window and market disagreement on total goals.",
    marketLean: "Home -0.25 / Over 2.75",
    modelLean: "Home 44% / Draw 27% / Away 29%",
    risk: "High"
  },
  {
    id: "wc-esp-jpn",
    kickoff: "2026-06-07 21:00 UTC",
    competition: "World Cup",
    home: "Spain",
    away: "Japan",
    context: "Group decider with possession edge for Spain but transition risk versus Japan.",
    marketLean: "Spain -0.75",
    modelLean: "Home 58% / Draw 24% / Away 18%",
    risk: "Medium"
  },
  {
    id: "ucl-bay-psg",
    kickoff: "2026-06-09 20:00 UTC",
    competition: "UEFA Champions League",
    home: "Bayern Munich",
    away: "PSG",
    context: "Knockout leg with sharp move on PSG team total after lineup rumors.",
    marketLean: "Both teams to score",
    modelLean: "Home 36% / Draw 26% / Away 38%",
    risk: "Medium"
  }
];

export const oddsAlerts: OddsAlert[] = [
  {
    id: "alert-1",
    match: "Sweden vs Greece",
    market: "Asian Handicap -1",
    timestamp: "2 min ago",
    severity: "Medium",
    message: "Sharp divergence detected: public tickets on Sweden, consensus money holding on Greece +1 with shortening away protection."
  },
  {
    id: "alert-2",
    match: "France vs Ivory Coast",
    market: "1X2 / Handicap",
    timestamp: "6 min ago",
    severity: "High",
    message: "Home win shortening across 4 primary books while team news confirms France first-choice front line available."
  },
  {
    id: "alert-3",
    match: "Mexico vs Serbia",
    market: "Over/Under 2.5",
    timestamp: "10 min ago",
    severity: "Low",
    message: "Total line stable, but under price drifting after weather downgrade and expected slower pitch conditions."
  }
];

export const topPredictions: PredictionCardData[] = [
  {
    matchId: "fra-civ",
    competition: "International Friendly",
    match: "France vs Ivory Coast",
    confidence: "High confidence",
    homeWin: "61%",
    draw: "23%",
    awayWin: "16%",
    scoreline: "2-0",
    explanation: "France has the stronger squad depth, a positive recent xG trend and favorable market reinforcement without excessive overpricing."
  },
  {
    matchId: "mex-srb",
    competition: "International Friendly",
    match: "Mexico vs Serbia",
    confidence: "Medium confidence",
    homeWin: "54%",
    draw: "26%",
    awayWin: "20%",
    scoreline: "2-1",
    explanation: "Home altitude and rest profile favor Mexico, but Serbia retains above-average set-piece threat and transition efficiency."
  },
  {
    matchId: "swe-gre",
    competition: "International Friendly",
    match: "Sweden vs Greece",
    confidence: "Low confidence",
    homeWin: "40%",
    draw: "33%",
    awayWin: "27%",
    scoreline: "1-1",
    explanation: "Public support on Sweden is not matched by handicap conviction; Greece profiles as a low-event opponent with stable defensive shape."
  }
];

export const teams = [
  { name: "Spain", competition: "World Cup", rating: "93.1", attack: "Elite", defense: "Elite", scheduleLoad: "Moderate", injuryImpact: "Low" },
  { name: "France", competition: "World Cup", rating: "92.8", attack: "Elite", defense: "Strong", scheduleLoad: "Low", injuryImpact: "Low" },
  { name: "Manchester City", competition: "Premier League", rating: "91.7", attack: "Elite", defense: "Strong", scheduleLoad: "High", injuryImpact: "Moderate" },
  { name: "Inter", competition: "Serie A", rating: "88.4", attack: "Strong", defense: "Strong", scheduleLoad: "Moderate", injuryImpact: "Moderate" },
  { name: "Bayer Leverkusen", competition: "Bundesliga", rating: "87.6", attack: "Strong", defense: "Stable", scheduleLoad: "Moderate", injuryImpact: "Low" },
  { name: "Boca Juniors", competition: "Liga Profesional", rating: "82.2", attack: "Stable", defense: "Stable", scheduleLoad: "Low", injuryImpact: "Moderate" }
];

export const backtests = [
  { model: "ensemble-v1.3", competition: "Premier League", accuracy: "54.8%", logLoss: "0.962", roi: "+6.4%" },
  { model: "ensemble-v1.3", competition: "LaLiga", accuracy: "53.1%", logLoss: "0.987", roi: "+3.2%" },
  { model: "totals-v0.9", competition: "Serie A", accuracy: "57.2%", logLoss: "0.911", roi: "+8.7%" },
  { model: "national-v0.5", competition: "International", accuracy: "52.0%", logLoss: "1.011", roi: "+1.5%" }
];

export const architectureModules = [
  {
    name: "Data Ingestion",
    description: "Adapters for fixtures, teams, player data, injury feeds, odds books, lineup sources and market snapshots.",
    items: ["HTTP and browser automation collectors", "Source normalization and deduplication", "Retry, throttling and audit logging"]
  },
  {
    name: "Warehouse and Modeling",
    description: "Structured storage for transactional, time-series and analytical workloads plus feature generation and model serving.",
    items: ["PostgreSQL + Prisma domain core", "Time-series odds storage", "Feature pipelines and model versioning"]
  },
  {
    name: "Automation and Alerts",
    description: "Scheduled jobs for market refresh, squad updates, score recalculation, anomaly detection and publication.",
    items: ["Prediction reruns by kickoff windows", "Odds anomaly scoring", "Report generation and webhook dispatch"]
  },
  {
    name: "Delivery Layer",
    description: "SEO-ready web app, APIs, backoffice and explainable reporting for public and internal workflows.",
    items: ["Next.js product surface", "REST endpoints for consumers", "Backtesting and operator dashboards"]
  }
];
