/**
 * A cache that works both on Cloudflare Workers and on a plain Node server.
 *
 * On Node, module state lives as long as the process, so a Map is the whole
 * story. On Workers there is no long-lived process — an isolate can be torn
 * down between any two requests — so module state is not a cache, it is a
 * coincidence. There we use the Cache API (`caches.default`), which is free,
 * unmetered, and shared by every request hitting the same datacentre.
 *
 * The practical consequence is that each active Cloudflare datacentre refreshes
 * independently. That is why the ticker TTL is a minute rather than ten seconds
 * once we are on Workers: a minute keeps total upstream traffic comfortably
 * inside CoinGecko's 30-calls-a-minute allowance even with many datacentres
 * live at once.
 *
 * Server only. Never import this from a component.
 */

export type CacheEntry<T> = { value: T; fetchedAt: number };

type EdgeCache = {
  match: (request: string) => Promise<Response | undefined>;
  put: (request: string, response: Response) => Promise<void>;
};

const memory = new Map<string, CacheEntry<unknown>>();

/**
 * `caches.default` exists only on Workers. Its absence is what tells us we are
 * on Node, which is a more reliable signal than sniffing the runtime.
 */
function edgeCache(): EdgeCache | undefined {
  const caches = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return caches?.default;
}

/** Cache keys have to be URLs. These are synthetic and never actually fetched. */
function keyUrl(key: string): string {
  return `https://market-cache.aadicrypto.internal/${key}`;
}

export async function readCache<T>(key: string): Promise<CacheEntry<T> | undefined> {
  const edge = edgeCache();
  if (!edge) return memory.get(key) as CacheEntry<T> | undefined;

  try {
    const hit = await edge.match(keyUrl(key));
    if (!hit) return undefined;
    return (await hit.json()) as CacheEntry<T>;
  } catch (error) {
    console.warn(`[cache] read failed for "${key}":`, error);
    return undefined;
  }
}

/**
 * `ttlSeconds` is how long the entry is allowed to physically survive, which is
 * deliberately longer than the freshness window the caller enforces — that is
 * what lets us serve a stale copy while a refresh is in flight instead of
 * showing an empty page.
 */
export async function writeCache<T>(
  key: string,
  entry: CacheEntry<T>,
  ttlSeconds: number,
): Promise<void> {
  const edge = edgeCache();
  if (!edge) {
    memory.set(key, entry);
    return;
  }

  try {
    await edge.put(
      keyUrl(key),
      new Response(JSON.stringify(entry), {
        headers: {
          "content-type": "application/json",
          "cache-control": `max-age=${ttlSeconds}`,
        },
      }),
    );
  } catch (error) {
    console.warn(`[cache] write failed for "${key}":`, error);
  }
}

/** True when running on Workers, where background work after a response dies. */
export function isEdgeRuntime(): boolean {
  return edgeCache() !== undefined;
}
