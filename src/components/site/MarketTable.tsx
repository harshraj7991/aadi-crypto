import { labelLink, SiteLink } from "./links";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { marketTabs } from "@/data/market";
import type { TickerCoin } from "@/types/market";
import { formatCompact, formatPrice } from "@/lib/format";
import { useCurrency } from "./currency";
import { useMarketTicker } from "./useMarketTicker";
import { Delta, Sparkline } from "./Delta";

/** How many rows the home page shows before "View all cryptocurrencies". */
const HOME_ROWS = 20;

/**
 * Gainers and losers are derived here rather than tagged upstream, so the tab a
 * coin lands in can never disagree with the 24h figure printed next to it.
 */
function filterRows(coins: TickerCoin[], tab: string): TickerCoin[] {
  if (tab === "gainers") {
    return coins.filter((c) => c.h24 > 0).sort((a, b) => b.h24 - a.h24);
  }
  if (tab === "losers") {
    return coins.filter((c) => c.h24 < 0).sort((a, b) => a.h24 - b.h24);
  }
  if (tab === "all") return coins;
  return coins.filter((c) => c.tags.includes(tab));
}

export function MarketTable() {
  const { currency } = useCurrency();
  const { coins, updatedAt, stale } = useMarketTicker();
  const [tab, setTab] = useState<string>("all");
  const [watched, setWatched] = useState<string[]>([]);

  const rows = useMemo(() => filterRows(coins, tab).slice(0, HOME_ROWS), [coins, tab]);

  return (
    <section aria-label="Crypto market" className="container-page py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[24px] font-extrabold text-ink">Crypto Market</h2>
        <p className="tabular text-[12.5px] text-muted-foreground">
          {stale ? "Last known prices" : "Live prices"} · shown in {currency}
          {updatedAt !== new Date(0).toISOString() && (
            <>
              {" · updated "}
              <time dateTime={updatedAt}>
                {new Date(updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </>
          )}
        </p>
      </div>

      <div className="scroll-x mt-4 border-b border-border">
        <ul role="tablist" className="flex gap-1 whitespace-nowrap">
          {marketTabs.map((t) => (
            <li key={t.id}>
              <button
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary-hover"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="scroll-x">
        <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
          <caption className="sr-only">
            Cryptocurrency prices, changes, market capitalisation and volume
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="w-10 py-2.5 pl-1 font-semibold">
                #
              </th>
              <th scope="col" className="py-2.5 font-semibold">
                Asset
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                Price
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                1h
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                24h
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                7d
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                Market Cap
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                24h Volume
              </th>
              <th scope="col" className="py-2.5 pl-6 font-semibold">
                7D
              </th>
              <th scope="col" className="py-2.5 pr-1 text-right font-semibold">
                <span className="sr-only">Watchlist</span>★
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const isWatched = watched.includes(c.symbol);
              return (
                <tr
                  key={c.symbol}
                  className="border-b border-border transition-colors hover:bg-surface"
                >
                  <td className="tabular py-3 pl-1 text-muted-foreground">{c.rank}</td>
                  <td className="py-3">
                    <SiteLink
                      target={labelLink(c.name)}
                      className="flex items-center gap-2.5 group"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-cool text-[10px] font-bold text-ink">
                        {c.symbol.slice(0, 3)}
                      </span>
                      <span className="font-semibold text-ink group-hover:text-primary-hover">
                        {c.name}
                      </span>
                      <span className="text-muted-foreground">{c.symbol}</span>
                    </SiteLink>
                  </td>
                  <td className="tabular py-3 text-right font-semibold text-ink">
                    {formatPrice(c.price, currency)}
                  </td>
                  <td className="py-3 text-right">
                    <Delta value={c.h1} className="text-[13px]" />
                  </td>
                  <td className="py-3 text-right">
                    <Delta value={c.h24} className="text-[13px]" />
                  </td>
                  <td className="py-3 text-right">
                    <Delta value={c.d7} className="text-[13px]" />
                  </td>
                  <td className="tabular py-3 text-right text-ink">
                    {formatCompact(c.marketCap, currency)}
                  </td>
                  <td className="tabular py-3 text-right text-muted-foreground">
                    {formatCompact(c.volume, currency)}
                  </td>
                  <td className="py-3 pl-6">
                    <Sparkline points={c.spark} up={c.d7 >= 0} />
                  </td>
                  <td className="py-3 pr-1 text-right">
                    <button
                      type="button"
                      aria-label={`${isWatched ? "Remove" : "Add"} ${c.name} ${
                        isWatched ? "from" : "to"
                      } watchlist`}
                      aria-pressed={isWatched}
                      onClick={() =>
                        setWatched((w) =>
                          w.includes(c.symbol) ? w.filter((s) => s !== c.symbol) : [...w, c.symbol],
                        )
                      }
                      className="rounded-sm p-1.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isWatched ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing in this view right now.
        </p>
      )}

      <div className="mt-4">
        <SiteLink
          target={labelLink("Markets")}
          className="inline-flex rounded-sm border border-border bg-background px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-primary hover:text-primary-hover"
        >
          View all cryptocurrencies
        </SiteLink>
      </div>
    </section>
  );
}
