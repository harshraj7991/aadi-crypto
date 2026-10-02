/** AadiCrypto Markets mega-menu structure and route catalogue (demo data, API-ready shape). */

export type MarketView =
  | "overview"
  | "movers"
  | "updates"
  | "global"
  | "technical"
  | "derivatives"
  | "trending"
  | "screener"
  | "sectors"
  | "launches"
  | "calendar"
  | "activity"
  | "onchain"
  | "etf"
  | "whales"
  | "indexes"
  | "research"
  | "rwa"
  | "stablecoins";

export type MarketItem = {
  label: string;
  path: string;
  badge?: "NEW";
  blurb?: string;
};

export type MarketSection = {
  heading: string;
  view: MarketView;
  items: MarketItem[];
};

export type MarketColumn = { sections: MarketSection[] };

function slug(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function items(prefix: string, labels: string[], overrides: Record<string, string> = {}) {
  return labels.map<MarketItem>((label) => ({
    label,
    path: overrides[label] ?? `${prefix}/${slug(label)}`,
  }));
}

export const marketsMenu: MarketColumn[] = [
  {
    sections: [
      {
        heading: "Home",
        view: "overview",
        items: [{ label: "Market Overview", path: "/markets" }],
      },
      {
        heading: "Market Movers",
        view: "movers",
        items: items(
          "/markets",
          [
            "All Crypto",
            "Top Gainers",
            "Top Losers",
            "Buy Dominant",
            "Sell Dominant",
            "52-Week High",
            "52-Week Low",
            "All-Time High Watch",
            "All-Time Low Watch",
            "Price Shockers",
            "Volume Shockers",
            "Most Active",
            "Trending Coins",
            "New Listings",
            "Recently Listed",
          ],
          {
            "Buy Dominant": "/markets/buy-dominant",
            "Sell Dominant": "/markets/sell-dominant",
            "Trending Coins": "/markets/trending",
          },
        ).map((item) =>
          item.label === "Buy Dominant" || item.label === "Sell Dominant"
            ? { ...item, badge: "NEW" as const }
            : item,
        ),
      },
      {
        heading: "Market Updates",
        view: "updates",
        items: items("/markets", ["Live Market Updates", "Market News", "Market Movers"]),
      },
    ],
  },
  {
    sections: [
      {
        heading: "Global Crypto Markets",
        view: "global",
        items: items("/markets/global", [
          "Global Market Overview",
          "Bitcoin Market",
          "Ethereum Market",
          "Altcoin Market",
          "Stablecoin Market",
          "DeFi Market",
          "Memecoin Market",
          "RWA Market",
          "AI Crypto Market",
          "Layer 1 Market",
          "Layer 2 Market",
          "Gaming & GameFi",
          "DePIN Market",
        ]),
      },
      {
        heading: "Technical Trends",
        view: "technical",
        items: items(
          "/markets/technical",
          [
            "Technical Overview",
            "Bullish Coins",
            "Bearish Coins",
            "Overbought",
            "Oversold",
            "Golden Cross",
            "Death Cross",
            "RSI Leaders",
            "MACD Signals",
            "Moving Average Signals",
            "Breakout Watch",
            "Support & Resistance",
            "Volatility Leaders",
          ],
          { "Technical Overview": "/markets/technical" },
        ),
      },
      {
        heading: "Open Interest & Derivatives",
        view: "derivatives",
        items: items(
          "/markets",
          [
            "Open Interest Trends",
            "OI Gainers",
            "OI Losers",
            "Funding Rates",
            "Positive Funding",
            "Negative Funding",
            "Long/Short Ratio",
            "Liquidations",
            "Long Liquidations",
            "Short Liquidations",
            "Futures Basis",
            "Options Market",
            "Put/Call Ratio",
            "Max Pain",
          ],
          {
            "Open Interest Trends": "/markets/open-interest",
            "Funding Rates": "/markets/funding-rates",
            "Long/Short Ratio": "/markets/long-short-ratio",
            Liquidations: "/markets/liquidations",
          },
        ),
      },
      {
        heading: "Trending Crypto",
        view: "trending",
        items: items(
          "/markets",
          [
            "Trending Coins",
            "Most Searched",
            "Most Watched",
            "Social Trending",
            "Developer Trending",
          ],
          { "Trending Coins": "/markets/trending" },
        ),
      },
      {
        heading: "Crypto Screener",
        view: "screener",
        items: items(
          "/markets/screener",
          [
            "Fundamental Screener",
            "Technical Screener",
            "Momentum Screener",
            "Volume Screener",
            "On-Chain Screener",
            "Derivatives Screener",
            "DeFi Screener",
            "Custom Screener",
          ],
          {
            "Fundamental Screener": "/markets/screener/fundamental",
            "Technical Screener": "/markets/screener/technical",
            "Momentum Screener": "/markets/screener/momentum",
            "Volume Screener": "/markets/screener/volume",
            "On-Chain Screener": "/markets/screener/on-chain",
            "Derivatives Screener": "/markets/screener/derivatives",
            "DeFi Screener": "/markets/screener/defi",
            "Custom Screener": "/markets/screener/custom",
          },
        ),
      },
    ],
  },
  {
    sections: [
      {
        heading: "Crypto Sector Analysis",
        view: "sectors",
        items: items(
          "/markets/sectors",
          [
            "Sector Overview",
            "Layer 1",
            "Layer 2",
            "DeFi",
            "Stablecoins",
            "Memecoins",
            "AI",
            "RWA",
            "DePIN",
            "Gaming",
            "NFT",
            "Exchange Tokens",
            "Privacy Coins",
            "Oracle",
            "Storage",
            "Interoperability",
            "Liquid Staking",
            "Restaking",
          ],
          { "Sector Overview": "/markets/sectors" },
        ),
      },
      {
        heading: "Token Launches & Listings",
        view: "launches",
        items: items(
          "/markets",
          [
            "New Listings",
            "Upcoming Listings",
            "Token Launches",
            "Token Generation Events",
            "ICO / IDO / IEO",
            "Launchpads",
            "Airdrops",
            "Token Unlocks",
            "Vesting Calendar",
            "Delistings",
          ],
          { Airdrops: "/markets/airdrops", "Token Unlocks": "/markets/token-unlocks" },
        ),
      },
      {
        heading: "Macro & Economic Calendar",
        view: "calendar",
        items: items(
          "/markets/calendar",
          [
            "Crypto Calendar",
            "Economic Calendar",
            "Federal Reserve",
            "Interest Rates",
            "Inflation",
            "CPI",
            "PPI",
            "Jobs Data",
            "GDP",
            "Central Banks",
            "Major Crypto Events",
            "Protocol Upgrades",
            "Hard Forks",
            "Token Unlock Calendar",
            "ETF Decision Calendar",
          ],
          { "Crypto Calendar": "/markets/calendar" },
        ),
      },
      {
        heading: "Market Activity",
        view: "activity",
        items: items("/markets/activity", [
          "Whale Activity",
          "Large Transactions",
          "Exchange Inflows",
          "Exchange Outflows",
          "Net Exchange Flow",
          "Stablecoin Flows",
          "Miner Activity",
          "Long-Term Holder Activity",
          "Smart Money",
          "Wallet Activity",
        ]),
      },
      {
        heading: "On-Chain Analysis",
        view: "onchain",
        items: items(
          "/markets/on-chain",
          [
            "Bitcoin On-Chain",
            "Ethereum On-Chain",
            "Active Addresses",
            "Transaction Count",
            "Network Fees",
            "Hash Rate",
            "Staking",
            "TVL",
            "DEX Volume",
            "Stablecoin Supply",
            "MVRV",
            "NVT",
            "Realized Cap",
            "Exchange Reserves",
          ],
        ),
      },
    ],
  },
  {
    sections: [
      {
        heading: "Crypto ETFs",
        view: "etf",
        items: items(
          "/markets/etfs",
          [
            "ETF Overview",
            "Bitcoin ETFs",
            "Ethereum ETFs",
            "ETF Inflows",
            "ETF Outflows",
            "ETF AUM",
            "ETF Volume",
            "ETF Calendar",
            "Institutional Holdings",
          ],
          {
            "ETF Overview": "/markets/etfs",
            "Bitcoin ETFs": "/markets/etfs/bitcoin",
            "Ethereum ETFs": "/markets/etfs/ethereum",
            "ETF Inflows": "/markets/etfs/flows",
          },
        ),
      },
      {
        heading: "Whale & Institutional Portfolios",
        view: "whales",
        items: items(
          "/markets/whales",
          [
            "Whale Tracker",
            "Public Company Holdings",
            "Bitcoin Treasury Companies",
            "Ethereum Treasury Companies",
            "Institutional Holdings",
            "Fund Holdings",
            "Government Holdings",
            "Top Wallets",
            "Smart Money Portfolios",
          ],
          { "Whale Tracker": "/markets/whales" },
        ),
      },
      {
        heading: "Crypto Indexes",
        view: "indexes",
        items: items("/markets/indexes", [
          "Crypto Market Index",
          "Large Cap Index",
          "Mid Cap Index",
          "Small Cap Index",
          "DeFi Index",
          "AI Index",
          "Memecoin Index",
          "Layer 1 Index",
          "Layer 2 Index",
          "RWA Index",
          "Index Contributors",
        ]),
      },
      {
        heading: "Market Research",
        view: "research",
        items: items("/markets/research", [
          "Market Analysis",
          "Technical Analysis",
          "On-Chain Research",
          "Derivatives Research",
          "Sector Research",
          "Institutional Research",
          "Weekly Market Outlook",
          "Monthly Market Outlook",
        ]),
      },
      {
        heading: "RWA & Tokenized Markets",
        view: "rwa",
        items: items("/markets/rwa", [
          "Tokenized Treasuries",
          "Tokenized Bonds",
          "Tokenized Gold",
          "Tokenized Commodities",
          "Tokenized Equities",
          "Real Estate Tokens",
          "RWA Protocols",
        ]),
      },
      {
        heading: "Stablecoins & Fiat",
        view: "stablecoins",
        items: items("/markets/stablecoins", [
          "Stablecoin Market",
          "USDT",
          "USDC",
          "DAI",
          "FDUSD",
          "Stablecoin Dominance",
          "Stablecoin Supply",
          "Stablecoin Flows",
          "Peg Monitor",
          "USD / Crypto",
          "EUR / Crypto",
          "INR / Crypto",
        ]),
      },
    ],
  },
];

export type MarketPage = MarketItem & { heading: string; view: MarketView };

/** Every markets page keyed by its path (deduped across menu repeats). */
export const marketPages: Record<string, MarketPage> = (() => {
  const map: Record<string, MarketPage> = {};
  for (const column of marketsMenu) {
    for (const section of column.sections) {
      for (const item of section.items) {
        if (!map[item.path]) map[item.path] = { ...item, heading: section.heading, view: section.view };
      }
    }
  }
  return map;
})();

export function findMarketPage(splat: string) {
  return marketPages[`/markets/${splat.replace(/^\/+|\/+$/g, "")}`];
}

/** Sibling links for the in-page rail. */
export function siblingPages(page: MarketPage) {
  return Object.values(marketPages).filter(
    (p) => p.heading === page.heading && p.path !== page.path,
  );
}
