export type MatchRow = {
  id: string;
  kickoff: string;
  competition: string;
  home: string;
  away: string;
  context: string;
  marketLean: string;
  modelLean: string;
  risk: string;
};

export type OddsAlert = {
  id: string;
  match: string;
  market: string;
  timestamp: string;
  severity: string;
  message: string;
  state?: string;
};

export type PredictionCardData = {
  matchId: string;
  competition: string;
  match: string;
  confidence: string;
  homeWin: string;
  draw: string;
  awayWin: string;
  scoreline: string;
  explanation: string;
};

export type MatchDetailView = {
  id: string;
  competition: string;
  roundName: string;
  kickoff: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  momentumTag: string;
  expectedGoals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    home: number | null;
    away: number | null;
  };
  restAdvantage: string;
  travelContext: string;
  marketOverview: string;
  operationalNotes: string[];
  predictionOverview: {
    homeWin: string;
    draw: string;
    awayWin: string;
    scoreline: string;
    risk: string;
    confidence: string;
    explanation: string;
  };
  lineupSummary: {
    home: string[];
    away: string[];
    homeFormation: string;
    awayFormation: string;
    confirmed: boolean;
  };
  keyPlayers: {
    home: string[];
    away: string[];
  };
  formGuide: {
    home: string;
    away: string;
  };
  statSnapshot: Array<{
    label: string;
    home: string;
    away: string;
  }>;
  marketSnapshot: {
    source: string;
    marketType: string;
    line: string;
    overround: string;
  };
  modelVsMarket: {
    modelHome: string;
    marketHome: string;
    modelDraw: string;
    marketDraw: string;
    modelAway: string;
    marketAway: string;
    valueLean: string;
  };
  recentEvents: Array<{
    minute: string;
    team: string;
    type: string;
    detail: string;
  }>;
  alertSummary: Array<{
    severity: string;
    category: string;
    state: string;
    message: string;
  }>;
  tacticalSummary: string[];
};

export type PlatformOverview = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
    tone: "accent" | "warning" | "danger" | "default";
  }>;
  topPredictions: PredictionCardData[];
  hotMatches: MatchRow[];
  alerts: OddsAlert[];
};

export type DataSourceDescriptor = {
  id: string;
  label: string;
  category: "fixtures" | "odds" | "lineups" | "rankings" | "news";
  mode: "api" | "scraper" | "manual";
  cadence: string;
  status: "active" | "planned" | "fallback";
  notes: string;
  enabled?: boolean;
};

export type OperatorOverview = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  tasks: Array<{
    name: string;
    stage: string;
    category: string;
    status: string;
    cadence: string;
    note: string;
    actionLabel: string;
    sourceCode: string;
    sourceLabel: string;
    sourceEnabled: boolean;
    runLocked: boolean;
    latestRunStatus: string;
    latestRunAt: string;
    latestRunId: string;
    processed: number;
    written: number;
    skipped: number;
  }>;
  alerts: Array<{
    id: string;
    match: string;
    severity: string;
    category: string;
    message: string;
    state: string;
    canAcknowledge: boolean;
    canResolve: boolean;
  }>;
  statusRing: Array<{
    label: string;
    value: string;
  }>;
  securitySummary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  auditTrail: Array<{
    actor: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    summary: string;
    ip: string;
    userAgent: string;
    path: string;
  }>;
  auditFilters: {
    actors: string[];
    actions: string[];
    entityTypes: string[];
    activeActor: string;
    activeAction: string;
    activeEntityType: string;
  };
  taskFilters: {
    categories: string[];
    statuses: string[];
    activeCategory: string;
    activeStatus: string;
  };
  alertFilters: {
    severities: string[];
    states: string[];
    activeSeverity: string;
    activeState: string;
  };
  securityEvents: Array<{
    actor: string;
    action: string;
    summary: string;
    createdAt: string;
    ip: string;
    path: string;
  }>;
  runFilters: {
    statuses: string[];
    stages: string[];
    names: string[];
    activeStatus: string;
    activeStage: string;
    activeName: string;
  };
  recentRuns: Array<{
    id: string;
    name: string;
    stage: string;
    status: string;
    processed: number;
    written: number;
    skipped: number;
    startedAt: string;
    finishedAt: string;
    durationMs: number | null;
    note: string;
  }>;
  ingestionRuns: Array<{
    name: string;
    processed: number;
    written: number;
    skipped: number;
    status: string;
    stage: string;
    startedAt: string;
    finishedAt: string;
    note: string;
  }>;
};
