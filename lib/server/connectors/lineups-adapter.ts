export type LineupRecord = {
  externalMatchId: string;
  teamName: string;
  formation: string;
  confirmed: boolean;
  players: { name: string; position: string; shirtNumber?: number }[];
};

export interface LineupAdapter {
  sourceId: string;
  fetchLineups(): Promise<LineupRecord[]>;
}

export class DemoLineupAdapter implements LineupAdapter {
  sourceId = "demo-lineups";

  async fetchLineups(): Promise<LineupRecord[]> {
    return [
      {
        externalMatchId: "demo-world-cup-spain-japan",
        teamName: "Spain",
        formation: "4-3-3",
        confirmed: true,
        players: [
          { name: "Unai Simon", position: "GK", shirtNumber: 1 },
          { name: "Dani Carvajal", position: "RB", shirtNumber: 2 },
          { name: "Aymeric Laporte", position: "CB", shirtNumber: 4 },
          { name: "Robin Le Normand", position: "CB", shirtNumber: 5 },
          { name: "Jordi Alba", position: "LB", shirtNumber: 18 },
          { name: "Rodri", position: "CM", shirtNumber: 16 },
          { name: "Pedri", position: "CM", shirtNumber: 8 },
          { name: "Gavi", position: "CM", shirtNumber: 9 },
          { name: "Lamine Yamal", position: "RW", shirtNumber: 19 },
          { name: "Alvaro Morata", position: "ST", shirtNumber: 7 },
          { name: "Nico Williams", position: "LW", shirtNumber: 11 }
        ]
      },
      {
        externalMatchId: "demo-world-cup-spain-japan",
        teamName: "Japan",
        formation: "4-2-3-1",
        confirmed: true,
        players: [
          { name: "Zion Suzuki", position: "GK", shirtNumber: 12 },
          { name: "Takehiro Tomiyasu", position: "RB", shirtNumber: 2 },
          { name: "Ko Itakura", position: "CB", shirtNumber: 3 },
          { name: "Maya Yoshida", position: "CB", shirtNumber: 22 },
          { name: "Yuto Nagatomo", position: "LB", shirtNumber: 5 },
          { name: "Wataru Endo", position: "DM", shirtNumber: 6 },
          { name: "Ao Tanaka", position: "DM", shirtNumber: 15 },
          { name: "Ritsu Doan", position: "AM", shirtNumber: 8 },
          { name: "Daichi Kamada", position: "AM", shirtNumber: 10 },
          { name: "Kaoru Mitoma", position: "AM", shirtNumber: 7 },
          { name: "Ayase Ueda", position: "ST", shirtNumber: 9 }
        ]
      },
      {
        externalMatchId: "demo-france-ivory-coast",
        teamName: "France",
        formation: "4-3-3",
        confirmed: false,
        players: [
          { name: "Mike Maignan", position: "GK", shirtNumber: 1 },
          { name: "Jules Kounde", position: "RB", shirtNumber: 2 },
          { name: "William Saliba", position: "CB", shirtNumber: 4 },
          { name: "Dayot Upamecano", position: "CB", shirtNumber: 5 },
          { name: "Theo Hernandez", position: "LB", shirtNumber: 22 },
          { name: "Aurelien Tchouameni", position: "CM", shirtNumber: 8 },
          { name: "Eduardo Camavinga", position: "CM", shirtNumber: 6 },
          { name: "Antoine Griezmann", position: "CM", shirtNumber: 7 },
          { name: "Ousmane Dembele", position: "RW", shirtNumber: 11 },
          { name: "Kylian Mbappe", position: "ST", shirtNumber: 10 },
          { name: "Marcus Thuram", position: "LW", shirtNumber: 15 }
        ]
      }
    ];
  }
}
