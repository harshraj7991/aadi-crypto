/**
 * Server-side entry for route loaders.
 *
 * This file is importable by the client on purpose: the Start plugin replaces
 * the handler with an RPC stub there. It must live outside `src/server/`,
 * which the import-protection plugin blocks from client code entirely.
 *
 * The handler body and its dynamic import are stripped from the client bundle,
 * so `market-source` and any API keys never reach the browser.
 */

import { createServerFn } from "@tanstack/react-start";
import type { MarketTicker } from "@/types/market";

export const fetchMarketTicker = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketTicker> => {
    const { getMarketTicker } = await import("@/server/market-source");
    return getMarketTicker();
  },
);
