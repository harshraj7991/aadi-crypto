/**
 * Live market data: fetch, normalise, cache.
 *
 * One cache for the whole process. However many browsers are on the site, the
 * upstream APIs see at most one call per TTL window — that is the whole point
 * of routing prices through the server instead of calling CoinGecko from React.
 *
 * Caching is stale-while-revalidate: once we hold any copy we return it
 * immediately and refresh in the background, so a slow or dead upstream never
 * blocks a page render. Redis replaces this cache the day we run more than one
 * Node process; the shape in `src/types/market.ts` does not change.
 *
 * Server only. Never import this from a component.
 */

import { coins as demoCoins } from "@/data/market";
import type { MarketTicker, TickerCoin } from "@/types/market";

const TICKER_TTL_MS = 10_000;
const FEAR_GREED_TTL_MS = 60 * 60 * 1000; // the index only moves once a day
const UPSTREAM_TIMEOUT_MS = 8_000;
const SPARK_POINTS = 12;

const COINGECKO = "https://api.coingecko.com/api/v3";

/** Provider ids paired with the labels the site already uses. */
const TRACKED_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "the-open-network", symbol: "TON", name: "Toncoin" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "ondo-finance", symbol: "ONDO", name: "Ondo" },
] as const;

// ---------------------------------------------------------------- fallback

/** What we serve before the first upstream call lands, or if it never does. */
const DEMO_TICKER: MarketTicker = {
  global: {
    marketCap: 2_410_000_000_000,
    marketCapChange24h: -1.62,
    volume24h: 142_800_000_000,
    btcDominance: 56.1,
    ethDominance: 17.5,
  },
  fearGreed: { value: 61, label: "Greed" },
  gas: { gwei: 12 },
  coins: demoCoins.map((coin) => ({
    id: coin.name.toLowerCase(),
    rank: coin.rank,
    symbol: coin.symbol,
    name: coin.name,
    price: coin.price,
    h1: coin.h1,
    h24: coin.h24,
    d7: coin.d7,
    marketCap: coin.marketCap,
    volume: coin.volume,
    spark: coin.spark,
  })),
  updatedAt: new Date(0).toISOString(),
  stale: true,
  source: "demo",
};

// ------------------------------------------------------------------- cache

type Slot<T> = { value: T; fetchedAt: number };

let tickerCache: Slot<MarketTicker> | undefined;
let fearGreedCache: Slot<MarketTicker["fearGreed"]> | undefined;
let inFlight: Promise<MarketTicker> | undefined;
let lastGood: MarketTicker | undefined;

/**
 * The only entry point. Returns immediately whenever we already hold a copy,
 * refreshing in the background when that copy has aged out.
 */
export async function getMarketTicker(): Promise<MarketTicker> {
  if (tickerCache) {
    if (Date.now() - tickerCache.fetchedAt >= TICKER_TTL_MS) {
      void refresh(); // stale-while-revalidate: nobody waits on this
    }
    return tickerCache.value;
  }
  return refresh();
}

/** Fire the first fetch at boot so the first visitor does not pay for it. */
export function primeMarketTicker(): void {
  void getMarketTicker();
}

function refresh(): Promise<MarketTicker> {
  // Collapse a stampede: fifty simultaneous cold requests make one upstream call.
  if (inFlight) return inFlight;

  inFlight = buildTicker()
    .then((value) => {
      tickerCache = { value, fetchedAt: Date.now() };
      lastGood = value;
      return value;
    })
    .catch((error: unknown) => {
      console.error("[market] upstream fetch failed, serving last known data:", error);
      const fallback: MarketTicker = { ...(lastGood ?? DEMO_TICKER), stale: true };
      // Hold the fallback for one TTL so a dead upstream is not hammered.
      tickerCache = { value: fallback, fetchedAt: Date.now() };
      return fallback;
    })
    .finally(() => {
      inFlight = undefined;
    });

  return inFlight;
}

// ------------------------------------------------------------------ upstream

async function buildTicker(): Promise<MarketTicker> {
  // Globals and coins are required; the other two are nice to have.
  const [globals, coins, fearGreed, gas] = await Promise.all([
    fetchGlobals(),
    fetchCoins(),
    fetchFearGreed(),
    fetchGas(),
  ]);

  return {
    global: globals,
    fearGreed,
    gas,
    coins,
    updatedAt: new Date().toISOString(),
    stale: false,
    source: "live",
  };
}

async function fetchGlobals(): Promise<MarketTicker["global"]> {
  const payload = await fetchJson<{
    data?: {
      total_market_cap?: Record<string, number>;
      total_volume?: Record<string, number>;
      market_cap_percentage?: Record<string, number>;
      market_cap_change_percentage_24h_usd?: number;
    };
  }>(`${COINGECKO}/global`, coingeckoHeaders());

  const data = payload.data;
  const marketCap = data?.total_market_cap?.["usd"];
  const volume24h = data?.total_volume?.["usd"];
  if (typeof marketCap !== "number" || typeof volume24h !== "number") {
    throw new Error("CoinGecko /global returned no USD totals");
  }

  return {
    marketCap,
    volume24h,
    marketCapChange24h: data?.market_cap_change_percentage_24h_usd ?? 0,
    btcDominance: data?.market_cap_percentage?.["btc"] ?? 0,
    ethDominance: data?.market_cap_percentage?.["eth"] ?? 0,
  };
}

type CoinGeckoMarket = {
  id?: string;
  symbol?: string;
  name?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price?: number[] };
};

async function fetchCoins(): Promise<TickerCoin[]> {
  const ids = TRACKED_COINS.map((coin) => coin.id).join(",");
  const url =
    `${COINGECKO}/coins/markets?vs_currency=usd&ids=${ids}` +
    `&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;

  const rows = await fetchJson<CoinGeckoMarket[]>(url, coingeckoHeaders());
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("CoinGecko /coins/markets returned no rows");
  }

  const byId = new Map(rows.filter((row) => row.id).map((row) => [row.id as string, row]));

  // Walk our own list, not the provider's, so a missing coin cannot silently
  // reorder or shorten the strip.
  const coins: TickerCoin[] = [];
  for (const [index, tracked] of TRACKED_COINS.entries()) {
    const row = byId.get(tracked.id);
    if (!row || typeof row.current_price !== "number") continue;
    coins.push({
      id: tracked.id,
      rank: row.market_cap_rank ?? index + 1,
      symbol: tracked.symbol,
      name: tracked.name,
      price: row.current_price,
      h1: row.price_change_percentage_1h_in_currency ?? 0,
      h24: row.price_change_percentage_24h_in_currency ?? 0,
      d7: row.price_change_percentage_7d_in_currency ?? 0,
      marketCap: row.market_cap ?? 0,
      volume: row.total_volume ?? 0,
      spark: downsample(row.sparkline_in_7d?.price ?? []),
    });
  }

  if (coins.length === 0) throw new Error("CoinGecko returned no usable coins");
  return coins;
}

/** The index publishes once a day, so it gets its own long cache. */
async function fetchFearGreed(): Promise<MarketTicker["fearGreed"]> {
  if (fearGreedCache && Date.now() - fearGreedCache.fetchedAt < FEAR_GREED_TTL_MS) {
    return fearGreedCache.value;
  }
  try {
    const payload = await fetchJson<{
      data?: Array<{ value?: string; value_classification?: string }>;
    }>("https://api.alternative.me/fng/?limit=1");

    const row = payload.data?.[0];
    const value = Number(row?.value);
    if (!Number.isFinite(value)) throw new Error("fear & greed returned no value");

    const result = { value, label: row?.value_classification ?? "" };
    fearGreedCache = { value: result, fetchedAt: Date.now() };
    return result;
  } catch (error) {
    console.warn("[market] fear & greed unavailable:", error);
    return fearGreedCache?.value ?? null;
  }
}

/** Optional: only runs when a key is configured. */
async function fetchGas(): Promise<MarketTicker["gas"]> {
  const key = process.env["ETHERSCAN_API_KEY"];
  if (!key) return null;
  try {
    const payload = await fetchJson<{ result?: { ProposeGasPrice?: string } }>(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${key}`,
    );
    const gwei = Number(payload.result?.ProposeGasPrice);
    return Number.isFinite(gwei) ? { gwei: Math.round(gwei) } : null;
  } catch (error) {
    console.warn("[market] gas oracle unavailable:", error);
    return null;
  }
}

// ------------------------------------------------------------------- helpers

function coingeckoHeaders(): HeadersInit {
  const key = process.env["COINGECKO_API_KEY"];
  return key ? { "x-cg-demo-api-key": key } : {};
}

async function fetchJson<T>(url: string, headers: HeadersInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${new URL(url).pathname} responded ${response.status}`);
  }
  return (await response.json()) as T;
}

/** The provider sends 168 hourly points; the sparkline draws twelve. */
function downsample(series: number[]): number[] {
  if (series.length <= SPARK_POINTS) return series;
  const step = (series.length - 1) / (SPARK_POINTS - 1);
  const points: number[] = [];
  for (let i = 0; i < SPARK_POINTS; i += 1) {
    points.push(series[Math.round(i * step)] ?? 0);
  }
  return points;
}
