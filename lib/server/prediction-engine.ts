type PredictionInput = {
  homeRating: number;
  awayRating: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  homeRestDays?: number | null;
  awayRestDays?: number | null;
  marketHomeProbability?: number | null;
  marketDrawProbability?: number | null;
  marketAwayProbability?: number | null;
};

type EngineResult = {
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  recommendedScoreline: string;
  confidenceScore: number;
  riskLabel: string;
  explanation: string;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function softmax(values: number[]) {
  const exps = values.map((value) => Math.exp(value));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

function riskFromConfidence(confidence: number) {
  if (confidence >= 0.62) return "Low";
  if (confidence >= 0.5) return "Medium";
  return "High";
}

export function runPredictionEngine(input: PredictionInput): EngineResult {
  const ratingDiff = (input.homeRating - input.awayRating) / 10;
  const xgDiff = input.expectedHomeGoals - input.expectedAwayGoals;
  const restEdge = ((input.homeRestDays ?? 0) - (input.awayRestDays ?? 0)) * 0.04;
  const homeSignal = ratingDiff * 0.08 + xgDiff * 0.75 + restEdge + 0.18;
  const awaySignal = ratingDiff * -0.08 + xgDiff * -0.68 - restEdge;
  const drawSignal = 0.22 - Math.abs(xgDiff) * 0.35 - Math.abs(ratingDiff) * 0.02;

  let [home, draw, away] = softmax([homeSignal, drawSignal, awaySignal]);

  if (
    input.marketHomeProbability != null &&
    input.marketDrawProbability != null &&
    input.marketAwayProbability != null
  ) {
    home = home * 0.7 + input.marketHomeProbability * 0.3;
    draw = draw * 0.7 + input.marketDrawProbability * 0.3;
    away = away * 0.7 + input.marketAwayProbability * 0.3;
    const total = home + draw + away;
    home /= total;
    draw /= total;
    away /= total;
  }

  const expectedHome = Math.max(0, Math.round(input.expectedHomeGoals));
  const expectedAway = Math.max(0, Math.round(input.expectedAwayGoals));
  const scoreline = `${expectedHome}-${expectedAway}`;
  const confidenceScore = Math.max(home, draw, away);
  const riskLabel = riskFromConfidence(confidenceScore);

  const explanationParts = [
    ratingDiff > 0 ? "home rating edge" : "away rating resilience",
    xgDiff > 0 ? "better attacking projection for the home side" : "limited scoring separation",
    Math.abs(restEdge) >= 0.08 ? "meaningful rest differential" : "rest profile broadly balanced"
  ];

  return {
    homeWinProbability: clamp01(home),
    drawProbability: clamp01(draw),
    awayWinProbability: clamp01(away),
    recommendedScoreline: scoreline,
    confidenceScore,
    riskLabel,
    explanation: `Engine blend signals: ${explanationParts.join(", ")}. Final probabilities are smoothed with market priors when available.`
  };
}
