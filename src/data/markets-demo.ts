/**
 * Deterministic fictional market dataset for the AadiCrypto Markets ecosystem.
 * Demo data only — shaped so a live provider adapter can replace it later.
 */

export type Sector =
  | "Layer 1"
  | "Layer 2"
  | "DeFi"
  | "Stablecoins"
  | "Memecoins"
  | "AI"
  | "RWA"
  | "DePIN"
  | "Gaming"
  | "NFT"
  | "Exchange Tokens"
  | "Privacy Coins"
  | "Oracle"
  | "Storage"
  | "Interoperability"
  | "Liquid Staking"
  | "Restaking";

export type MarketAsset = {
  rank: number;
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  h1: number;
  h24: number;
  d7: number;
  d30: number;
  volume: number;
  volumeChange: number;
  marketCap: number;
  supply: number;
  spark: number[];
  buyPressure: number; // 0-100, >50 = buy-side dominant
  rsi: number;
  openInterest: number;
  oiChange24: number;
  funding: number; // %, 8h
  liquidations24: number;
  longShort: number;
  fromAth: number; // negative % below all-time high
  fromAtl: number; // positive % above all-time low
  high52: number;
  low52: number;
  volatility30: number;
  trendScore: number;
  listedDaysAgo: number;
};

const seedList: Array<[string, string, Sector, number, number]> = [
  ["BTC", "Bitcoin", "Layer 1", 68420.15, 1_352_000_000_000],
  ["ETH", "Ethereum", "Layer 1", 3512.88, 422_300_000_000],
  ["USDT", "Tether", "Stablecoins", 1.0, 138_900_000_000],
  ["SOL", "Solana", "Layer 1", 174.62, 81_600_000_000],
  ["BNB", "BNB", "Exchange Tokens", 592.31, 86_200_000_000],
  ["XRP", "XRP", "Layer 1", 0.6142, 34_100_000_000],
  ["USDC", "USD Coin", "Stablecoins", 1.0, 33_400_000_000],
  ["DOGE", "Dogecoin", "Memecoins", 0.1284, 18_700_000_000],
  ["TON", "Toncoin", "Layer 1", 7.42, 18_300_000_000],
  ["ADA", "Cardano", "Layer 1", 0.4412, 15_600_000_000],
  ["AVAX", "Avalanche", "Layer 1", 27.14, 10_900_000_000],
  ["LINK", "Chainlink", "Oracle", 16.88, 10_400_000_000],
  ["TRX", "Tron", "Layer 1", 0.1182, 10_200_000_000],
  ["DOT", "Polkadot", "Interoperability", 5.92, 8_400_000_000],
  ["MATIC", "Polygon", "Layer 2", 0.5821, 5_800_000_000],
  ["SHIB", "Shiba Inu", "Memecoins", 0.0000182, 10_700_000_000],
  ["LTC", "Litecoin", "Layer 1", 72.41, 5_400_000_000],
  ["UNI", "Uniswap", "DeFi", 8.42, 5_050_000_000],
  ["ATOM", "Cosmos", "Interoperability", 6.72, 2_620_000_000],
  ["NEAR", "NEAR Protocol", "AI", 4.31, 4_720_000_000],
  ["ARB", "Arbitrum", "Layer 2", 0.7412, 2_910_000_000],
  ["OP", "Optimism", "Layer 2", 1.612, 2_180_000_000],
  ["FIL", "Filecoin", "Storage", 4.12, 2_340_000_000],
  ["RNDR", "Render", "AI", 6.18, 2_390_000_000],
  ["FET", "Artificial Superintelligence", "AI", 1.212, 3_060_000_000],
  ["TAO", "Bittensor", "AI", 312.4, 2_240_000_000],
  ["ONDO", "Ondo", "RWA", 1.132, 1_610_000_000],
  ["MKR", "Maker", "DeFi", 2412.0, 2_180_000_000],
  ["AAVE", "Aave", "DeFi", 92.14, 1_370_000_000],
  ["LDO", "Lido DAO", "Liquid Staking", 1.842, 1_640_000_000],
  ["EIGEN", "EigenLayer", "Restaking", 3.214, 720_000_000],
  ["PEPE", "Pepe", "Memecoins", 0.0000094, 3_950_000_000],
  ["WIF", "dogwifhat", "Memecoins", 2.114, 2_110_000_000],
  ["IMX", "Immutable", "Gaming", 1.412, 2_090_000_000],
  ["SAND", "The Sandbox", "Gaming", 0.3182, 760_000_000],
  ["AXS", "Axie Infinity", "Gaming", 5.62, 840_000_000],
  ["APE", "ApeCoin", "NFT", 0.9124, 560_000_000],
  ["BLUR", "Blur", "NFT", 0.2182, 380_000_000],
  ["XMR", "Monero", "Privacy Coins", 162.4, 2_990_000_000],
  ["ZEC", "Zcash", "Privacy Coins", 24.12, 390_000_000],
  ["HNT", "Helium", "DePIN", 6.42, 1_060_000_000],
  ["IOTX", "IoTeX", "DePIN", 0.0512, 490_000_000],
  ["AR", "Arweave", "Storage", 24.18, 1_580_000_000],
  ["INJ", "Injective", "DeFi", 24.62, 2_420_000_000],
  ["SUI", "Sui", "Layer 1", 1.842, 4_620_000_000],
  ["SEI", "Sei", "Layer 1", 0.4218, 1_420_000_000],
  ["STRK", "Starknet", "Layer 2", 0.5124, 780_000_000],
  ["DAI", "Dai", "Stablecoins", 1.0, 5_320_000_000],
  ["FDUSD", "First Digital USD", "Stablecoins", 1.0, 2_410_000_000],
  ["CRV", "Curve DAO", "DeFi", 0.3124, 390_000_000],
];

/** Small deterministic hash so numbers never change between server and browser. */
function rand(seed: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function span(seed: string, salt: number, min: number, max: number) {
  return min + rand(seed, salt) * (max - min);
}

function round(value: number, digits = 2) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export const assets: MarketAsset[] = seedList.map(([symbol, name, sector, price, marketCap], i) => {
  const stable = sector === "Stablecoins";
  const scale = stable ? 0.02 : 1;
  const h24 = round(span(symbol, 2, -14, 16) * scale);
  const d7 = round(span(symbol, 3, -26, 32) * scale);
  const volume = Math.round(marketCap * span(symbol, 5, 0.02, 0.42));
  const spark = Array.from({ length: 16 }, (_, k) => round(span(symbol, 40 + k, 20, 46), 1));
  return {
    rank: i + 1,
    symbol,
    name,
    sector,
    price,
    h1: round(span(symbol, 1, -2.4, 2.6) * scale),
    h24,
    d7,
    d30: round(span(symbol, 4, -42, 58) * scale),
    volume,
    volumeChange: round(span(symbol, 6, -68, 420)),
    marketCap,
    supply: Math.round(marketCap / price),
    spark,
    buyPressure: Math.round(span(symbol, 7, 18, 88)),
    rsi: Math.round(span(symbol, 8, 14, 88)),
    openInterest: Math.round(marketCap * span(symbol, 9, 0.005, 0.14)),
    oiChange24: round(span(symbol, 10, -22, 34)),
    funding: round(span(symbol, 11, -0.08, 0.09), 4),
    liquidations24: Math.round(span(symbol, 12, 0.4, 180) * 1_000_000),
    longShort: round(span(symbol, 13, 0.6, 2.2)),
    fromAth: round(-span(symbol, 14, 0.4, 88)),
    fromAtl: round(span(symbol, 15, 40, 4200)),
    high52: round(price * span(symbol, 16, 1.0, 2.6), price > 10 ? 2 : 6),
    low52: round(price * span(symbol, 17, 0.24, 0.99), price > 10 ? 2 : 6),
    volatility30: round(span(symbol, 18, 1.2, 9.6)),
    trendScore: Math.round(span(symbol, 19, 20, 99)),
    listedDaysAgo: Math.round(span(symbol, 20, 1, 2400)),
  };
});

export const bySymbol = (symbol: string) => assets.find((a) => a.symbol === symbol);

/* ------------------------------- record sets ------------------------------ */

export type EventRow = {
  date: string;
  time: string;
  title: string;
  region: string;
  impact: "High" | "Medium" | "Low";
  detail: string;
};

export const marketEvents: EventRow[] = [
  { date: "12 Mar", time: "18:00", title: "US CPI release", region: "United States", impact: "High", detail: "Consensus 2.9% year on year" },
  { date: "13 Mar", time: "23:30", title: "Federal Reserve rate decision", region: "United States", impact: "High", detail: "Market prices no change" },
  { date: "14 Mar", time: "12:00", title: "Ethereum protocol upgrade rehearsal", region: "Global", impact: "Medium", detail: "Testnet fork window" },
  { date: "15 Mar", time: "16:30", title: "US jobs data", region: "United States", impact: "High", detail: "Non-farm payrolls" },
  { date: "17 Mar", time: "09:00", title: "ETF decision deadline", region: "United States", impact: "High", detail: "Spot altcoin fund review" },
  { date: "18 Mar", time: "05:30", title: "India digital asset committee briefing", region: "India", impact: "Medium", detail: "Tax framework consultation" },
  { date: "19 Mar", time: "14:00", title: "Euro area inflation print", region: "Europe", impact: "Medium", detail: "Flash estimate" },
  { date: "21 Mar", time: "11:00", title: "Large token unlock", region: "Global", impact: "Medium", detail: "$212M cliff release" },
  { date: "24 Mar", time: "19:00", title: "GDP revision", region: "United States", impact: "Low", detail: "Second estimate" },
  { date: "26 Mar", time: "10:00", title: "Layer 2 mainnet hard fork", region: "Global", impact: "Medium", detail: "Fee market change" },
];

export type FundRow = {
  name: string;
  ticker: string;
  asset: string;
  aum: number;
  flow24: number;
  flow7: number;
  volume: number;
  fee: number;
};

export const etfFunds: FundRow[] = [
  { name: "Northline Bitcoin Trust", ticker: "NBTC", asset: "Bitcoin", aum: 21_400_000_000, flow24: 128_000_000, flow7: 412_000_000, volume: 1_240_000_000, fee: 0.19 },
  { name: "Harborcrest Bitcoin Fund", ticker: "HBTF", asset: "Bitcoin", aum: 14_800_000_000, flow24: -64_000_000, flow7: 96_000_000, volume: 820_000_000, fee: 0.25 },
  { name: "Ridgeway Spot Bitcoin", ticker: "RDGB", asset: "Bitcoin", aum: 9_200_000_000, flow24: 41_000_000, flow7: -22_000_000, volume: 610_000_000, fee: 0.21 },
  { name: "Northline Ether Trust", ticker: "NETH", asset: "Ethereum", aum: 6_100_000_000, flow24: 32_000_000, flow7: 148_000_000, volume: 340_000_000, fee: 0.24 },
  { name: "Harborcrest Ether Fund", ticker: "HETF", asset: "Ethereum", aum: 3_400_000_000, flow24: -12_000_000, flow7: 18_000_000, volume: 190_000_000, fee: 0.29 },
  { name: "Meridian Digital Basket", ticker: "MDBX", asset: "Multi-asset", aum: 1_900_000_000, flow24: 8_400_000, flow7: 26_000_000, volume: 74_000_000, fee: 0.42 },
];

export type HolderRow = {
  name: string;
  type: string;
  asset: string;
  holding: string;
  value: number;
  change30: number;
};

export const holders: HolderRow[] = [
  { name: "Arclight Systems", type: "Public company", asset: "BTC", holding: "212,400 BTC", value: 14_500_000_000, change30: 2.4 },
  { name: "Vanterra Holdings", type: "Public company", asset: "BTC", holding: "48,900 BTC", value: 3_340_000_000, change30: 0 },
  { name: "Solstice Capital", type: "Fund", asset: "ETH", holding: "610,000 ETH", value: 2_140_000_000, change30: 6.1 },
  { name: "Kestrel Reserve", type: "Government", asset: "BTC", holding: "94,200 BTC", value: 6_440_000_000, change30: -1.8 },
  { name: "Blue Meadow Partners", type: "Fund", asset: "Multi-asset", holding: "Mixed basket", value: 980_000_000, change30: 4.2 },
  { name: "Wallet 0x7f…c41a", type: "Smart money", asset: "ETH", holding: "182,000 ETH", value: 639_000_000, change30: 12.8 },
  { name: "Wallet bc1q…9ke2", type: "Whale", asset: "BTC", holding: "18,600 BTC", value: 1_270_000_000, change30: -3.4 },
];

export type IndexRow = {
  name: string;
  level: number;
  change24: number;
  change30: number;
  constituents: number;
};

export const indexRows: IndexRow[] = [
  { name: "AadiCrypto Market Index", level: 1842.4, change24: -1.2, change30: 8.4 },
  { name: "Large Cap Index", level: 2410.8, change24: -0.9, change30: 6.2 },
  { name: "Mid Cap Index", level: 1128.2, change24: 1.4, change30: 11.8 },
  { name: "Small Cap Index", level: 684.1, change24: 2.8, change30: 18.4 },
  { name: "DeFi Index", level: 942.6, change24: 0.6, change30: -4.1 },
  { name: "AI Index", level: 1584.3, change24: 3.2, change30: 22.6 },
  { name: "Memecoin Index", level: 412.9, change24: -4.6, change30: -12.2 },
  { name: "Layer 1 Index", level: 1720.5, change24: -0.4, change30: 7.1 },
  { name: "Layer 2 Index", level: 806.7, change24: 1.1, change30: -2.4 },
  { name: "RWA Index", level: 1284.0, change24: 0.8, change30: 14.6 },
].map((row) => ({ ...row, constituents: 10 + Math.round(rand(row.name, 1) * 40) }));

export type ResearchRow = {
  title: string;
  desk: string;
  updated: string;
  summary: string;
};

export const researchNotes: ResearchRow[] = [
  { title: "Weekly market outlook", desk: "Markets desk", updated: "Updated today", summary: "Liquidity thinned into the weekend while derivatives positioning stayed long." },
  { title: "Monthly market outlook", desk: "Markets desk", updated: "Updated 4 days ago", summary: "Sector rotation favoured AI and RWA baskets over memecoins." },
  { title: "Derivatives structure review", desk: "Derivatives desk", updated: "Updated 2 days ago", summary: "Funding normalised after a crowded long unwind near the highs." },
  { title: "On-chain accumulation study", desk: "Data desk", updated: "Updated 6 days ago", summary: "Long-term holder supply kept rising despite the drawdown." },
  { title: "Sector rotation tracker", desk: "Research desk", updated: "Updated 1 day ago", summary: "Breadth improved in mid caps while large caps consolidated." },
  { title: "Institutional flow monitor", desk: "Institutions desk", updated: "Updated today", summary: "Fund flows turned mildly positive across spot vehicles." },
];

export const globalStatsCards = [
  { label: "Total Market Cap", value: "$2.41T", change: -1.62 },
  { label: "24h Market Cap Change", value: "-$39.4B", change: -1.62 },
  { label: "24h Trading Volume", value: "$142.8B", change: 8.14 },
  { label: "BTC Dominance", value: "56.1%", change: -0.34 },
  { label: "ETH Dominance", value: "17.5%", change: 0.42 },
  { label: "Stablecoin Market Cap", value: "$168.2B", change: 0.38 },
  { label: "DeFi TVL", value: "$98.4B", change: 2.14 },
  { label: "Fear & Greed", value: "61 · Greed", change: null as number | null },
];

export const breadth = { advancing: 612, declining: 388, unchanged: 41 };
