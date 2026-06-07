export type RankingRecord = {
  teamName: string;
  elo: number;
  attack: number;
  defense: number;
  formScore: number;
  injuryImpact: number;
  scheduleLoad: number;
};

export interface RankingAdapter {
  sourceId: string;
  fetchRankings(): Promise<RankingRecord[]>;
}

export class DemoRankingAdapter implements RankingAdapter {
  sourceId = "demo-rankings";

  async fetchRankings(): Promise<RankingRecord[]> {
    return [
      { teamName: "France", elo: 2012, attack: 88, defense: 85, formScore: 0.78, injuryImpact: 0.08, scheduleLoad: 0.45 },
      { teamName: "Spain", elo: 1985, attack: 86, defense: 82, formScore: 0.74, injuryImpact: 0.05, scheduleLoad: 0.52 },
      { teamName: "England", elo: 1960, attack: 84, defense: 80, formScore: 0.71, injuryImpact: 0.12, scheduleLoad: 0.61 },
      { teamName: "Japan", elo: 1820, attack: 76, defense: 74, formScore: 0.68, injuryImpact: 0.03, scheduleLoad: 0.38 },
      { teamName: "Mexico", elo: 1780, attack: 73, defense: 70, formScore: 0.65, injuryImpact: 0.06, scheduleLoad: 0.42 },
      { teamName: "Serbia", elo: 1775, attack: 75, defense: 68, formScore: 0.62, injuryImpact: 0.10, scheduleLoad: 0.55 },
      { teamName: "Sweden", elo: 1740, attack: 69, defense: 72, formScore: 0.58, injuryImpact: 0.04, scheduleLoad: 0.48 },
      { teamName: "Greece", elo: 1700, attack: 65, defense: 70, formScore: 0.55, injuryImpact: 0.02, scheduleLoad: 0.35 },
      { teamName: "Ivory Coast", elo: 1690, attack: 70, defense: 64, formScore: 0.52, injuryImpact: 0.07, scheduleLoad: 0.40 },
      { teamName: "Man City", elo: 2050, attack: 91, defense: 88, formScore: 0.82, injuryImpact: 0.09, scheduleLoad: 0.68 },
      { teamName: "Arsenal", elo: 2020, attack: 87, defense: 86, formScore: 0.79, injuryImpact: 0.06, scheduleLoad: 0.65 },
      { teamName: "Bayern Munich", elo: 2005, attack: 89, defense: 83, formScore: 0.76, injuryImpact: 0.11, scheduleLoad: 0.58 },
      { teamName: "PSG", elo: 1995, attack: 90, defense: 78, formScore: 0.73, injuryImpact: 0.08, scheduleLoad: 0.50 }
    ];
  }
}
