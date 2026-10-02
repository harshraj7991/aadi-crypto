/**
 * Public read-only HTTP API, served ahead of the SSR handler in `src/server.ts`.
 *
 * Kept deliberately small: these responses are public, cacheable and carry no
 * credentials, so the edge (and the browser) can hold them without asking us
 * again. No CORS header is set, which keeps them same-origin by default.
 */

import { getMarketTicker } from "./market-source";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" } as const;

/** Returns null when the request is not ours, so SSR handles it instead. */
export async function handleApiRequest(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/")) return null;

  if (pathname === "/api/v1/market/ticker") {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
    const ticker = await getMarketTicker();
    return new Response(JSON.stringify(ticker), {
      headers: {
        ...JSON_HEADERS,
        // The edge serves this for a minute, then prefers a stale copy over a
        // slow one for another five. This is what keeps upstream traffic flat
        // no matter how many browsers are polling.
        "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
