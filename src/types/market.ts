/**
 * The wire contract for live market data.
 *
 * This is the one shape both sides agree on: the server builds it, the browser
 * reads it, and `/api/v1/market/ticker` serves it. Providers are mapped into
 * this shape in `src/server/market-source.ts` and nowhere else, so swapping
 * CoinGecko for another provider never reaches a component.
 */

export type TickerCoin = {
  /** Provider id, kept so we can refetch a single coin later. */
  id: string;
  rank: number;
  symbol: string;
  name: string;
  /** All money values are USD. The browser converts for display. */
  price: number;
  h1: number;
  h24: number;
  d7: number;
  marketCap: number;
  volume: number;
  /** Twelve evenly spaced points from the provider's 7-day series. */
  spark: number[];
  /**
   * Sector and trending labels the market table filters on. Gainers and losers
   * are not in here — those are derived from `h24` at render time so they can
   * never disagree with the number on screen.
   */
  tags: string[];
};

export type TickerGlobals = {
  marketCap: number;
  marketCapChange24h: number;
  volume24h: number;
  btcDominance: number;
  ethDominance: number;
};

export type MarketTicker = {
  global: TickerGlobals;
  /** Null when the upstream is unavailable — the strip just drops the item. */
  fearGreed: { value: number; label: string } | null;
  /** Null unless ETHERSCAN_API_KEY is set. */
  gas: { gwei: number } | null;
  /** Top 100 by market cap, highest first. The header strip shows the first ten. */
  coins: TickerCoin[];
  /** ISO timestamp of the upstream fetch this data came from. */
  updatedAt: string;
  /** True when we are serving the last good copy after an upstream failure. */
  stale: boolean;
  /** "demo" means no upstream call has ever succeeded in this process. */
  source: "live" | "demo";
};
