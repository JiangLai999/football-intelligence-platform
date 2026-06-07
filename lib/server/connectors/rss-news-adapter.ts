export type NewsItem = {
  externalId: string;
  teamName: string;
  headline: string;
  body: string;
  category: string;
  publishedAt: string;
  source: string;
  url: string;
};

const RSS_FEEDS: Array<{ source: string; url: string; teamKeywords: string[]; category: string }> = [
  {
    source: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    teamKeywords: [],
    category: "news"
  },
  {
    source: "Sky Sports",
    url: "https://www.skysports.com/rss/12040",
    teamKeywords: [],
    category: "news"
  },
  {
    source: "ESPN",
    url: "https://www.espn.com/espn/rss/soccer/news",
    teamKeywords: [],
    category: "news"
  }
];

function extractTagContent(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractTeamName(title: string, description: string, knownTeams: string[]): string {
  const haystack = `${title} ${description}`.toLowerCase();
  for (const team of knownTeams) {
    if (haystack.includes(team.toLowerCase())) return team;
  }
  return "General";
}

function categorizeItem(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/injury|injur|injured|knock|strain/)) return "injury";
  if (text.match(/suspend|ban|red card/)) return "suspension";
  if (text.match(/transfer|sign|loan|deal/)) return "transfer";
  if (text.match(/lineup|line-up|xi|starting/)) return "lineup";
  return "news";
}

function parseRss(xml: string): Array<{ title: string; description: string; link: string; pubDate: string; guid: string }> {
  const items: Array<{ title: string; description: string; link: string; pubDate: string; guid: string }> = [];

  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
  for (const item of itemMatches) {
    items.push({
      title: extractTagContent(item, "title"),
      description: extractTagContent(item, "description"),
      link: extractTagContent(item, "link"),
      pubDate: extractTagContent(item, "pubDate"),
      guid: extractTagContent(item, "guid")
    });
  }

  return items;
}

export class RssNewsAdapter {
  sourceId = "rss-news-aggregator";

  private knownTeams = [
    "Arsenal", "Chelsea", "Liverpool", "Man City", "Manchester City", "Manchester United",
    "Tottenham", "Newcastle", "Aston Villa", "Brighton", "West Ham",
    "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla",
    "Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen",
    "PSG", "Marseille", "Monaco", "Lyon",
    "Juventus", "Inter Milan", "AC Milan", "Napoli", "Roma",
    "Spain", "France", "Germany", "Italy", "England", "Portugal",
    "Argentina", "Brazil", "Netherlands", "Belgium", "Croatia",
    "Japan", "Mexico", "USA", "Canada", "Serbia", "Sweden", "Greece", "Ivory Coast"
  ];

  async fetchNews(options: { knownTeams?: string[]; maxItemsPerFeed?: number } = {}): Promise<NewsItem[]> {
    const teams = options.knownTeams ?? this.knownTeams;
    const maxPerFeed = options.maxItemsPerFeed ?? 15;
    const allNews: NewsItem[] = [];

    for (const feed of RSS_FEEDS) {
      try {
        const response = await fetch(feed.url, {
          headers: { "User-Agent": "FootballIntelligencePlatform/0.1" },
          next: { revalidate: 600 }
        });

        if (!response.ok) {
          console.warn(`[RssNewsAdapter] ${feed.source} failed: ${response.status}`);
          continue;
        }

        const xml = await response.text();
        const items = parseRss(xml).slice(0, maxPerFeed);

        for (const item of items) {
          if (!item.title || !item.link) continue;

          allNews.push({
            externalId: `rss-${feed.source.toLowerCase().replace(/\s+/g, "-")}-${item.guid || item.link}`,
            teamName: extractTeamName(item.title, item.description, teams),
            headline: item.title,
            body: item.description.slice(0, 280),
            category: categorizeItem(item.title, item.description),
            publishedAt: item.pubDate || new Date().toISOString(),
            source: feed.source,
            url: item.link
          });
        }
      } catch (error) {
        console.warn(`[RssNewsAdapter] ${feed.source} error:`, error);
        continue;
      }
    }

    allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return allNews.slice(0, 50);
  }
}
