import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import type { MarketTicker } from "@/types/market";

const rootRoute = getRouteApi("__root__");

export const marketTickerQueryKey = ["market", "ticker"] as const;

async function fetchTicker(): Promise<MarketTicker> {
  const response = await fetch("/api/v1/market/ticker");
  if (!response.ok) throw new Error(`ticker request failed: ${response.status}`);
  return (await response.json()) as MarketTicker;
}

/**
 * Live market data for the header strips.
 *
 * The server-rendered copy comes from the root loader, so the first paint has
 * real numbers in the HTML. After hydration this polls our own API — never a
 * third-party API, so the key stays on the server and the upstream call count
 * does not grow with the audience.
 *
 * React Query dedupes on the key, so every component calling this hook shares
 * one request.
 */
export function useMarketTicker(): MarketTicker {
  const { marketTicker } = rootRoute.useLoaderData();

  const { data } = useQuery({
    queryKey: marketTickerQueryKey,
    queryFn: fetchTicker,
    initialData: marketTicker,
    // The server refreshes once a minute in production, so polling faster than
    // that only spends requests on an identical answer.
    staleTime: 60_000,
    refetchInterval: 60_000,
    // A failed poll keeps the last good numbers on screen rather than blanking.
    retry: 1,
  });

  return data;
}
