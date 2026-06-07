export type OddsRecord = {
  externalMatchId: string;
  source: string;
  marketType: string;
  line: string | null;
  homeOdds: number | null;
  drawOdds: number | null;
  awayOdds: number | null;
  recordedAt: string;
};

export interface OddsAdapter {
  sourceId: string;
  fetchOdds(): Promise<OddsRecord[]>;
}

export class DemoOddsAdapter implements OddsAdapter {
  sourceId = "demo-odds";

  async fetchOdds(): Promise<OddsRecord[]> {
    return [
      {
        externalMatchId: "demo-france-ivory-coast",
        source: "Bet365",
        marketType: "ONE_X_TWO",
        line: null,
        homeOdds: 1.17,
        drawOdds: 5.56,
        awayOdds: 10.5,
        recordedAt: new Date().toISOString()
      },
      {
        externalMatchId: "demo-mexico-serbia",
        source: "Bet365",
        marketType: "ONE_X_TWO",
        line: null,
        homeOdds: 1.2,
        drawOdds: 5.15,
        awayOdds: 9.8,
        recordedAt: new Date().toISOString()
      }
    ];
  }
}
