type OddsInput = {
  homeOdds?: number | null;
  drawOdds?: number | null;
  awayOdds?: number | null;
};

export type OddsAnalysis = {
  impliedHome: number | null;
  impliedDraw: number | null;
  impliedAway: number | null;
  overround: number | null;
  lean: string;
};

function implied(odds?: number | null) {
  if (!odds || odds <= 0) return null;
  return 1 / odds;
}

export function analyzeThreeWayOdds(input: OddsInput): OddsAnalysis {
  const impliedHome = implied(input.homeOdds);
  const impliedDraw = implied(input.drawOdds);
  const impliedAway = implied(input.awayOdds);
  const total = [impliedHome, impliedDraw, impliedAway].reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const overround = total > 0 ? total - 1 : null;

  const entries = [
    ["Home", input.homeOdds],
    ["Draw", input.drawOdds],
    ["Away", input.awayOdds]
  ].filter((entry): entry is [string, number] => typeof entry[1] === "number");

  const lean = entries.length
    ? `${entries.sort((a, b) => a[1] - b[1])[0][0]} ${entries.sort((a, b) => a[1] - b[1])[0][1].toFixed(2)}`
    : "Market feed pending";

  return {
    impliedHome,
    impliedDraw,
    impliedAway,
    overround,
    lean
  };
}
