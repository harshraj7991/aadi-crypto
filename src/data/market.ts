/** Static demo market data for the AadiCrypto homepage (front-end only, no live feed yet). */

export const USD_INR = 87.4;

export type Currency = "USD" | "INR";

export type Coin = {
  rank: number;
  symbol: string;
  name: string;
  price: number; // in USD
  h1: number;
  h24: number;
  d7: number;
  marketCap: number; // USD
  volume: number; // USD
  spark: number[];
  tags: Array<"gainers" | "losers" | "trending" | "new" | "defi" | "ai" | "rwa" | "memes">;
};

export const coins: Coin[] = [
  {
    rank: 1,
    symbol: "BTC",
    name: "Bitcoin",
    price: 68420.15,
    h1: -0.32,
    h24: -2.41,
    d7: 3.85,
    marketCap: 1_352_000_000_000,
    volume: 41_800_000_000,
    spark: [62, 64, 63, 66, 69, 67, 71, 70, 68, 66, 65, 64],
    tags: ["trending"],
  },
  {
    rank: 2,
    symbol: "ETH",
    name: "Ethereum",
    price: 3512.88,
    h1: 0.41,
    h24: 4.12,
    d7: 7.64,
    marketCap: 422_300_000_000,
    volume: 19_450_000_000,
    spark: [30, 31, 30, 32, 33, 35, 34, 36, 38, 37, 39, 40],
    tags: ["gainers", "trending"],
  },
  {
    rank: 3,
    symbol: "USDT",
    name: "Tether",
    price: 1.0,
    h1: 0.01,
    h24: -0.02,
    d7: 0.01,
    marketCap: 138_900_000_000,
    volume: 62_100_000_000,
    spark: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
    tags: [],
  },
  {
    rank: 4,
    symbol: "SOL",
    name: "Solana",
    price: 174.62,
    h1: 1.12,
    h24: 6.78,
    d7: 12.4,
    marketCap: 81_600_000_000,
    volume: 5_240_000_000,
    spark: [22, 24, 23, 26, 28, 27, 30, 33, 32, 35, 37, 39],
    tags: ["gainers", "trending"],
  },
  {
    rank: 5,
    symbol: "BNB",
    name: "BNB",
    price: 592.31,
    h1: -0.18,
    h24: 1.06,
    d7: 2.11,
    marketCap: 86_200_000_000,
    volume: 1_910_000_000,
    spark: [28, 28, 29, 30, 29, 31, 30, 31, 32, 31, 32, 33],
    tags: [],
  },
  {
    rank: 6,
    symbol: "XRP",
    name: "XRP",
    price: 0.6142,
    h1: -0.74,
    h24: -3.92,
    d7: -6.18,
    marketCap: 34_100_000_000,
    volume: 1_420_000_000,
    spark: [38, 37, 36, 35, 33, 34, 32, 31, 30, 29, 28, 27],
    tags: ["losers"],
  },
  {
    rank: 7,
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.1284,
    h1: 0.62,
    h24: -1.44,
    d7: 4.02,
    marketCap: 18_700_000_000,
    volume: 980_000_000,
    spark: [24, 25, 26, 25, 27, 26, 28, 27, 26, 27, 26, 27],
    tags: ["memes"],
  },
  {
    rank: 8,
    symbol: "TON",
    name: "Toncoin",
    price: 7.42,
    h1: 2.06,
    h24: 9.31,
    d7: 18.72,
    marketCap: 18_300_000_000,
    volume: 640_000_000,
    spark: [18, 19, 21, 22, 24, 26, 25, 28, 30, 33, 35, 38],
    tags: ["gainers", "trending", "new"],
  },
  {
    rank: 9,
    symbol: "LINK",
    name: "Chainlink",
    price: 16.88,
    h1: -0.44,
    h24: 2.86,
    d7: 5.31,
    marketCap: 10_400_000_000,
    volume: 512_000_000,
    spark: [26, 27, 26, 28, 29, 30, 29, 31, 32, 33, 32, 34],
    tags: ["defi", "ai"],
  },
  {
    rank: 10,
    symbol: "ONDO",
    name: "Ondo",
    price: 1.132,
    h1: -1.28,
    h24: -5.64,
    d7: 9.18,
    marketCap: 1_610_000_000,
    volume: 214_000_000,
    spark: [32, 34, 33, 36, 35, 33, 31, 30, 29, 28, 27, 26],
    tags: ["losers", "rwa"],
  },
];

export const marketTabs = [
  { id: "all", label: "All" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "defi", label: "DeFi" },
  { id: "ai", label: "AI" },
  { id: "rwa", label: "RWA" },
  { id: "memes", label: "Memes" },
] as const;

export const globalStats = [
  { label: "Global Market Cap", value: "$2.41T", change: -1.62 },
  { label: "24h Volume", value: "$142.8B", change: 8.14 },
  { label: "BTC Dominance", value: "56.1%", change: -0.34 },
  { label: "ETH Dominance", value: "17.5%", change: 0.42 },
  { label: "Gas", value: "12 gwei", change: null },
  { label: "Fear & Greed", value: "61 · Greed", change: null },
];

export const snapshot = [
  { label: "Global Market Cap", value: "$2.41T", sub: "24h", change: -1.62 },
  { label: "24h Volume", value: "$142.8B", sub: "24h", change: 8.14 },
  { label: "BTC Dominance", value: "56.1%", sub: "24h", change: -0.34 },
  { label: "Top Gainer", value: "TON", sub: "$7.42", change: 9.31 },
  { label: "Top Loser", value: "ONDO", sub: "$1.13", change: -5.64 },
];

export const trendingTopics = [
  "Bitcoin ETF",
  "Ethereum",
  "Solana",
  "Stablecoins",
  "RWA",
  "India Regulation",
  "AI Tokens",
  "Token Unlocks",
  "Restaking",
];

export const intelligence = [
  { label: "DeFi TVL", value: "$98.4B", change: 2.14, note: "Across 412 protocols" },
  { label: "Stablecoin Market Cap", value: "$168.2B", change: 0.38, note: "USDT dominance 62%" },
  { label: "DEX Volume (24h)", value: "$7.9B", change: 11.6, note: "Solana leads at 34%" },
  { label: "Perp Volume (24h)", value: "$142.3B", change: -4.2, note: "OI $41.8B" },
  { label: "Token Unlocks (7d)", value: "$412M", change: null, note: "ARB, SEI, JTO" },
  { label: "US Spot BTC ETF Flow", value: "-$128M", change: null, note: "Net, previous session" },
];

export const whyMoving = {
  symbol: "BTC",
  change: -2.41,
  reasons: [
    {
      tag: "Market catalyst",
      text: "Long liquidations near $69,000 accelerated a fast intraday unwind of leveraged positions.",
      source: "AadiCrypto Markets",
    },
    {
      tag: "ETF / institutional",
      text: "US spot Bitcoin ETFs recorded a second consecutive session of net outflows.",
      source: "AadiCrypto ETF Center",
    },
    {
      tag: "Macro / regulatory",
      text: "Stronger-than-expected inflation data pushed rate-cut expectations further out.",
      source: "AadiCrypto Macro",
    },
  ],
};
