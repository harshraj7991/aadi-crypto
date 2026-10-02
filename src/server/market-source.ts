/**
 * Live market data: fetch, normalise, cache.
 *
 * Whatever the audience, the upstream APIs see at most one call per TTL window
 * per datacentre — that is the whole point of routing prices through the server
 * instead of calling CoinGecko from React. The cache itself lives in
 * `market-cache.ts`, which papers over the difference between a Node process
 * and a Cloudflare isolate.
 *
 * Reads are stale-while-revalidate within a bounded window: once the copy we
 * hold goes stale we hand it back immediately and refresh alongside, so a slow
 * upstream never blocks a render. Past a hard ceiling we stop pretending and
 * wait for fresh data, which keeps the worst case bounded even on Workers where
 * work started after a response is not guaranteed to finish.
 *
 * Server only. Never import this from a component.
 */

import { coins as demoCoins } from "@/data/market";
import type { MarketTicker, TickerCoin } from "@/types/market";
import { isEdgeRuntime, readCache, writeCache } from "./market-cache";

/**
 * On a Node process one cache serves everyone, so ten seconds is affordable.
 * On Workers every active datacentre refreshes on its own, so the same ten
 * seconds would multiply by the number of live datacentres and blow through
 * CoinGecko's 30-a-minute allowance. A minute keeps the total safe either way.
 */
const TICKER_TTL_MS = isEdgeRuntime() ? 60_000 : 10_000;

/**
 * How stale we will let a copy get while a refresh runs alongside. Past this we
 * wait for fresh data instead — on Workers a refresh kicked off without being
 * awaited may simply be cancelled, so without a ceiling the data could stick.
 */
const TICKER_HARD_MS = TICKER_TTL_MS * 3;

const FEAR_GREED_TTL_MS = 60 * 60 * 1000; // the index only moves once a day
const TRENDING_TTL_MS = 10 * 60 * 1000; // trending turns over in minutes
const SECTOR_TTL_MS = 6 * 60 * 60 * 1000; // which coins are "DeFi" barely changes
const UPSTREAM_TIMEOUT_MS = 8_000;
const SPARK_POINTS = 12;
const COIN_COUNT = 100;

const TICKER_KEY = "ticker";
const FEAR_GREED_KEY = "fear-greed";
const TRENDING_KEY = "trending";
const SECTORS_KEY = "sectors";

const COINGECKO = "https://api.coingecko.com/api/v3";
const USER_AGENT = "AadiCrypto/1.0 (+https://github.com/harshraj7991/aadi-crypto)";

/**
 * Sector tabs in the market table, mapped to CoinGecko category ids.
 *
 * Six-hour cache, so these are four calls twice a day rather than four on every
 * refresh.
 */
const SECTORS: ReadonlyArray<{ tag: string; category: string }> = [
  { tag: "defi", category: "decentralized-finance-defi" },
  { tag: "ai", category: "artificial-intelligence" },
  { tag: "rwa", category: "real-world-assets-rwa" },
  { tag: "memes", category: "meme-token" },
];

const SECTOR_TAGS = new Set(SECTORS.map((sector) => sector.tag));

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

/** Collapses a stampede inside one isolate. Across isolates the TTL does it. */
let inFlight: Promise<MarketTicker> | undefined;

/**
 * The only entry point.
 *
 * Fresh copy  -> return it.
 * Stale copy  -> return it and refresh alongside.
 * Too stale, or nothing cached -> wait for fresh data.
 */
export async function getMarketTicker(): Promise<MarketTicker> {
  const hit = await readCache<MarketTicker>(TICKER_KEY);

  if (hit) {
    const age = Date.now() - hit.fetchedAt;
    if (age < TICKER_TTL_MS) return hit.value;
    if (age < TICKER_HARD_MS) {
      void refresh(hit.value); // not awaited: nobody waits on a warm cache
      return { ...hit.value, stale: true };
    }
  }

  return refresh(hit?.value);
}

function refresh(lastGood: MarketTicker | undefined): Promise<MarketTicker> {
  if (inFlight) return inFlight;

  inFlight = buildTicker()
    .then(async (value) => {
      // Physical lifetime outlives the freshness window, so there is always
      // something to serve while the next refresh runs.
      await writeCache(TICKER_KEY, { value, fetchedAt: Date.now() }, (TICKER_HARD_MS / 1000) * 4);
      return value;
    })
    .catch((error: unknown) => {
      console.error("[market] upstream fetch failed, serving last known data:", error);
      return { ...(lastGood ?? DEMO_TICKER), stale: true };
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

  // Both sit behind long caches of their own, so these are nearly always cache
  // reads rather than calls.
  const [trending, sectors] = await Promise.all([getTrending(), getSectors()]);

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

function tagsFor(id: string, trending: Set<string>, sectors: Record<string, string[]>): string[] {
  const tags = sectors[id] ?? [];
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
 * Coins people are actually looking up right now.
 *
 * Ten-minute cache. A failure returns an empty set, which just means no coin is
 * tagged "trending" until the next attempt — never a failed page.
 */
async function getTrending(): Promise<Set<string>> {
  const hit = await readCache<string[]>(TRENDING_KEY);
  if (hit && Date.now() - hit.fetchedAt < TRENDING_TTL_MS) return new Set(hit.value);

  try {
    const payload = await fetchJson<{ coins?: Array<{ item?: { id?: string } }> }>(
      `${COINGECKO}/search/trending`,
      coingeckoHeaders(),
    );
    const ids = (payload.coins ?? [])
      .map((entry) => entry.item?.id)
      .filter((id): id is string => !!id);
    if (ids.length === 0) throw new Error("trending returned no coins");
    await writeCache(TRENDING_KEY, { value: ids, fetchedAt: Date.now() }, TRENDING_TTL_MS / 250);
    return new Set(ids);
  } catch (error) {
    console.warn("[market] trending unavailable:", error);
    return new Set(hit?.value ?? []);
  }
}

/**
 * Which coins belong to which sector tab, as coin id -> tags.
 *
 * Six-hour cache. A sector that fails to load leaves its tab empty rather than
 * taking the refresh down with it, and a sector that returns nothing is not
 * allowed to overwrite a good answer.
 */
async function getSectors(): Promise<Record<string, string[]>> {
  const hit = await readCache<Record<string, string[]>>(SECTORS_KEY);
  if (hit && Date.now() - hit.fetchedAt < SECTOR_TTL_MS) return hit.value;

  const results = await Promise.all(
    SECTORS.map(async ({ tag, category }) => {
      try {
        const rows = await fetchJson<CoinGeckoMarket[]>(
          `${COINGECKO}/coins/markets?vs_currency=usd&category=${category}` +
            `&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
          coingeckoHeaders(),
        );
        // A 200 carrying an empty list is not success — caching that would
        // blank the tab for the next six hours.
        if (rows.length === 0) throw new Error("no coins returned");
        return { tag, ids: rows.map((row) => row.id).filter((id): id is string => !!id) };
      } catch (error) {
        console.warn(`[market] sector "${tag}" unavailable:`, error);
        return { tag, ids: [] as string[] };
      }
    }),
  );

  const byCoin: Record<string, string[]> = {};
  let anySucceeded = false;
  for (const { tag, ids } of results) {
    if (ids.length > 0) anySucceeded = true;
    for (const id of ids) {
      const existing = byCoin[id];
      if (existing) existing.push(tag);
      else byCoin[id] = [tag];
    }
  }

  if (!anySucceeded) return hit?.value ?? {};

  await writeCache(SECTORS_KEY, { value: byCoin, fetchedAt: Date.now() }, SECTOR_TTL_MS / 250);
  console.info(`[market] sector membership refreshed: ${Object.keys(byCoin).length} coins tagged`);
  return byCoin;
}

/** The index publishes once a day, so it gets its own long cache. */
async function fetchFearGreed(): Promise<MarketTicker["fearGreed"]> {
  const hit = await readCache<MarketTicker["fearGreed"]>(FEAR_GREED_KEY);
  if (hit && Date.now() - hit.fetchedAt < FEAR_GREED_TTL_MS) return hit.value;

  try {
    const payload = await fetchJson<{
      data?: Array<{ value?: string; value_classification?: string }>;
    }>("https://api.alternative.me/fng/?limit=1");

    const row = payload.data?.[0];
    const value = Number(row?.value);
    if (!Number.isFinite(value)) throw new Error("fear & greed returned no value");

    const result = { value, label: row?.value_classification ?? "" };
    await writeCache(
      FEAR_GREED_KEY,
      { value: result, fetchedAt: Date.now() },
      FEAR_GREED_TTL_MS / 250,
    );
    return result;
  } catch (error) {
    console.warn("[market] fear & greed unavailable:", error);
    return hit?.value ?? null;
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
    headers: {
      accept: "application/json",
      // Cloudflare Workers send no User-Agent by default and CoinGecko answers
      // those with a 403. Node happens to send one, which is why this only
      // shows up once you deploy to the edge.
      "user-agent": USER_AGENT,
      ...headers,
    },
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
