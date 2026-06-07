export type FixtureRecord = {
  externalId: string;
  competition: string;
  season: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  venue: string;
  status: string;
};

export interface FixtureAdapter {
  sourceId: string;
  fetchFixtures(): Promise<FixtureRecord[]>;
}

export class DemoFixtureAdapter implements FixtureAdapter {
  sourceId = "demo-fixtures";

  async fetchFixtures(): Promise<FixtureRecord[]> {
    return [
      {
        externalId: "demo-world-cup-spain-japan",
        competition: "World Cup",
        season: "2026",
        homeTeam: "Spain",
        awayTeam: "Japan",
        kickoffAt: "2026-06-07T21:00:00.000Z",
        venue: "Seattle Field",
        status: "SCHEDULED"
      },
      {
        externalId: "demo-france-ivory-coast",
        competition: "International Friendly",
        season: "2026",
        homeTeam: "France",
        awayTeam: "Ivory Coast",
        kickoffAt: "2026-06-05T03:10:00.000Z",
        venue: "Nantes",
        status: "SCHEDULED"
      }
    ];
  }
}
