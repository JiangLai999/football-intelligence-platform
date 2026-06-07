export type NewsItem = {
  externalId: string;
  teamName: string;
  headline: string;
  body: string;
  category: string;
  publishedAt: string;
  source?: string;
  url?: string;
};

export interface NewsAdapter {
  sourceId: string;
  fetchNews(): Promise<NewsItem[]>;
}

export class DemoNewsAdapter implements NewsAdapter {
  sourceId = "demo-news";

  async fetchNews(): Promise<NewsItem[]> {
    return [
      {
        externalId: "news-mbappe-fit",
        teamName: "France",
        headline: "Mbappe cleared for Ivory Coast friendly after minor knock",
        body: "Kylian Mbappe has been declared fit for France's upcoming friendly against Ivory Coast after recovering from a minor ankle knock sustained in training.",
        category: "injury",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        externalId: "news-yamal-record",
        teamName: "Spain",
        headline: "Lamine Yamal set to become youngest World Cup starter",
        body: "Barcelona wunderkind Lamine Yamal is expected to start against Japan, which would make him the youngest player to start a World Cup match in modern history.",
        category: "lineup",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        externalId: "news-mitoma-return",
        teamName: "Japan",
        headline: "Mitoma returns to training ahead of Spain clash",
        body: "Brighton winger Kaoru Mitoma has returned to full training after a three-week absence, boosting Japan's attacking options for the Spain fixture.",
        category: "injury",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        externalId: "news-city-injury-crisis",
        teamName: "Man City",
        headline: "Man City face defensive shortage ahead of Arsenal clash",
        body: "Pep Guardiola confirmed multiple defensive absences for the upcoming fixture against Arsenal, with Stones, Ake and Dias all doubtful.",
        category: "injury",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        externalId: "news-psg-transfer",
        teamName: "PSG",
        headline: "PSG close to completing defensive reinforcement signing",
        body: "Paris Saint-Germain are reportedly finalizing terms for a central defender to bolster their backline ahead of the Bayern Munich fixture.",
        category: "transfer",
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}
