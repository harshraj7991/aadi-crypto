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

/**
 * CoinGecko without a key is throttled per IP at roughly five to fifteen calls
 * a minute, which a ten-second refresh (two calls each) reliably exceeds — you
 * get 429s and the strip quietly falls back to the last good copy. A free demo
 * key lifts the ceiling to thirty a minute, which ten seconds fits inside.
 *
 * So the refresh matches whether a key is configured. The browser keeps polling
 * every ten seconds either way; without a key it simply gets more cache hits.
 */
const TICKER_TTL_MS = process.env["COINGECKO_API_KEY"] ? 10_000 : 30_000;
const FEAR_GREED_TTL_MS = 60 * 60 * 1000; // the index only moves once a day
const TRENDING_TTL_MS = 5 * 60 * 1000; // trending turns over in minutes, not seconds
const SECTOR_TTL_MS = 6 * 60 * 60 * 1000; // which coins are "DeFi" barely changes
const UPSTREAM_TIMEOUT_MS = 8_000;
const SPARK_POINTS = 12;
const COIN_COUNT = 100;

const COINGECKO = "https://api.coingecko.com/api/v3";

/**
 * Sector tabs in the market table, mapped to CoinGecko category ids.
 *
 * Membership is fetched on its own six-hour clock, so these cost four calls
 * every six hours rather than four on every refresh.
 */
const SECTORS: ReadonlyArray<{ tag: string; category: string }> = [
  { tag: "defi", category: "decentralized-finance-defi" },
  { tag: "ai", category: "artificial-intelligence" },
  { tag: "rwa", category: "real-world-assets-rwa" },
  { tag: "memes", category: "meme-token" },
];

const SECTOR_TAGS = new Set(SECTORS.map((sector) => sector.tag));

/** Spacing between background calls, so they never arrive as a burst. */
const METADATA_GAP_MS = 1_500;

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
    tags: coin.tags.filter((tag) => SECTOR_TAGS.has(tag)),
  })),
  updatedAt: new Date(0).toISOString(),
  stale: true,
  source: "demo",
};

// ------------------------------------------------------------------- cache

type Slot<T> = { value: T; fetchedAt: number };

let tickerCache: Slot<MarketTicker> | undefined;
let fearGreedCache: Slot<MarketTicker["fearGreed"]> | undefined;
let trendingCache: Slot<Set<string>> | undefined;
let sectorCache: Slot<Map<string, string[]>> | undefined;
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
  // Never log the key itself — only whether one was found, and what that means
  // for the refresh rate. Silent fallback to the slow path is hard to diagnose.
  console.info(
    `[market] CoinGecko key ${process.env["COINGECKO_API_KEY"] ? "configured" : "NOT set"}` +
      ` — refreshing every ${TICKER_TTL_MS / 1000}s`,
  );
  void getMarketTicker();
}

function refresh(): Promise<MarketTicker> {
  // Collapse a stampede: fifty simultaneous cold requests make one upstream call.
  if (inFlight) return inFlight;

  inFlight = buildTicker()
    .then((value) => {
      tickerCache = { value, fetchedAt: Date.now() };
      lastGood = value;
      void refreshMetadata(); // background, deliberately not awaited
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
  // Only the calls the page actually needs run here. The slow-moving metadata
  // (trending, sector membership) refreshes on its own clock in the background,
  // so it can never compete with these for the provider's rate limit — firing
  // all seven at once reliably earns a 429 on CoinGecko's free tier.
  const [globals, coins, fearGreed, gas] = await Promise.all([
    fetchGlobals(),
    fetchCoins(),
    fetchFearGreed(),
    fetchGas(),
  ]);

  // Sector and trending labels are read from whatever the background refresh
  // last stored. Empty on the very first build; filled within a few seconds.
  const trending = trendingCache?.value ?? new Set<string>();
  const sectors = sectorCache?.value ?? new Map<string, string[]>();

  return {
    global: globals,
    fearGreed,
    gas,
    coins: coins.map((coin) => ({ ...coin, tags: tagsFor(coin.id, trending, sectors) })),
    updatedAt: new Date().toISOString(),
    stale: false,
    source: "live",
  };
}

function tagsFor(id: string, trending: Set<string>, sectors: Map<string, string[]>): string[] {
  const tags = sectors.get(id) ?? [];
  return trending.has(id) ? ["trending", ...tags] : tags;
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

async function fetchCoins(): Promise<Array<Omit<TickerCoin, "tags">>> {
  const url =
    `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc` +
    `&per_page=${COIN_COUNT}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;

  const rows = await fetchJson<CoinGeckoMarket[]>(url, coingeckoHeaders());
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("CoinGecko /coins/markets returned no rows");
  }

  const coins = rows
    .filter((row) => row.id && row.symbol && typeof row.current_price === "number")
    .map((row, index) => ({
      id: row.id as string,
      rank: row.market_cap_rank ?? index + 1,
      symbol: (row.symbol as string).toUpperCase(),
      name: row.name ?? (row.symbol as string).toUpperCase(),
      price: row.current_price as number,
      h1: row.price_change_percentage_1h_in_currency ?? 0,
      h24: row.price_change_percentage_24h_in_currency ?? 0,
      d7: row.price_change_percentage_7d_in_currency ?? 0,
      marketCap: row.market_cap ?? 0,
      volume: row.total_volume ?? 0,
      spark: downsample(row.sparkline_in_7d?.price ?? []),
    }));

  if (coins.length === 0) throw new Error("CoinGecko returned no usable coins");
  return coins;
}

/**
 * Background refresh for the slow-moving labels.
 *
 * Runs after a successful ticker build, never as part of one, and strictly one
 * call at a time with a gap between them. Nothing here is awaited by a request,
 * so a rate limit or an outage costs an empty tab, never a slow page.
 */
let metadataRefreshing = false;

async function refreshMetadata(): Promise<void> {
  if (metadataRefreshing) return;
  const now = Date.now();
  const trendingDue = !trendingCache || now - trendingCache.fetchedAt >= TRENDING_TTL_MS;
  const sectorsDue = !sectorCache || now - sectorCache.fetchedAt >= SECTOR_TTL_MS;
  if (!trendingDue && !sectorsDue) return;

  metadataRefreshing = true;
  try {
    if (trendingDue) {
      await refreshTrending();
      if (sectorsDue) await sleep(METADATA_GAP_MS);
    }
    if (sectorsDue) await refreshSectors();
  } finally {
    metadataRefreshing = false;
  }
}

/** Coins people are actually looking up right now. */
async function refreshTrending(): Promise<void> {
  try {
    const payload = await fetchJson<{ coins?: Array<{ item?: { id?: string } }> }>(
      `${COINGECKO}/search/trending`,
      coingeckoHeaders(),
    );
    const ids = new Set(
      (payload.coins ?? []).map((entry) => entry.item?.id).filter((id): id is string => !!id),
    );
    if (ids.size > 0) trendingCache = { value: ids, fetchedAt: Date.now() };
  } catch (error) {
    console.warn("[market] trending unavailable:", error);
  }
}

/** Which coins belong to which sector tab, as coin id -> tags. */
async function refreshSectors(): Promise<void> {
  const byCoin = new Map<string, string[]>();
  let anySucceeded = false;

  for (const [index, { tag, category }] of SECTORS.entries()) {
    if (index > 0) await sleep(METADATA_GAP_MS);
    try {
      const rows = await fetchJson<CoinGeckoMarket[]>(
        `${COINGECKO}/coins/markets?vs_currency=usd&category=${category}` +
          `&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        coingeckoHeaders(),
      );
      // A 200 carrying an empty list is not success — caching that would blank
      // the tab for the next six hours.
      if (rows.length === 0) {
        console.warn(`[market] sector "${tag}" returned no coins`);
        continue;
      }
      anySucceeded = true;
      for (const row of rows) {
        if (!row.id) continue;
        const existing = byCoin.get(row.id);
        if (existing) existing.push(tag);
        else byCoin.set(row.id, [tag]);
      }
    } catch (error) {
      console.warn(`[market] sector "${tag}" unavailable:`, error);
    }
  }

  // Never replace a good map with a worse one built from failed calls.
  if (anySucceeded) {
    sectorCache = { value: byCoin, fetchedAt: Date.now() };
    console.info(`[market] sector membership refreshed: ${byCoin.size} coins tagged`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
