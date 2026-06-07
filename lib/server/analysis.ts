export function evaluateRisk(homeWin: number, draw: number, awayWin: number) {
  const max = Math.max(homeWin, draw, awayWin);
  if (max >= 0.62) return "Low";
  if (max >= 0.5) return "Medium";
  return "High";
}

export function deriveMarketLean(homeOdds?: number | null, drawOdds?: number | null, awayOdds?: number | null) {
  if (!homeOdds || !drawOdds || !awayOdds) return "Market feed pending";
  const lowest = Math.min(homeOdds, drawOdds, awayOdds);
  if (lowest === homeOdds) return `Home ${homeOdds.toFixed(2)}`;
  if (lowest === drawOdds) return `Draw ${drawOdds.toFixed(2)}`;
  return `Away ${awayOdds.toFixed(2)}`;
}
