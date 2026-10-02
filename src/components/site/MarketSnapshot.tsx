import type { Currency } from "@/data/market";
import { trendingTopics } from "@/data/market";
import type { MarketTicker } from "@/types/market";
import { formatCompact, formatPrice } from "@/lib/format";
import { useCurrency } from "./currency";
import { useMarketTicker } from "./useMarketTicker";
import { Delta } from "./Delta";
import { labelLink, SiteLink } from "./links";

type SnapshotCard = { label: string; value: string; sub: string; change: number | null };

/**
 * The five headline cards.
 *
 * Top gainer and loser are picked from the top hundred by market cap, which
 * keeps thinly traded coins with wild percentages out of the headline slot.
 */
function buildSnapshot(ticker: MarketTicker, currency: Currency): SnapshotCard[] {
  const ranked = [...ticker.coins].sort((a, b) => b.h24 - a.h24);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const cards: SnapshotCard[] = [
    {
      label: "Global Market Cap",
      value: formatCompact(ticker.global.marketCap, currency),
      sub: "24h",
      change: ticker.global.marketCapChange24h,
    },
    {
      label: "24h Volume",
      value: formatCompact(ticker.global.volume24h, currency),
      sub: "24h",
      change: null,
    },
    {
      label: "BTC Dominance",
      value: `${ticker.global.btcDominance.toFixed(1)}%`,
      sub: "24h",
      change: null,
    },
  ];

  if (best) {
    cards.push({
      label: "Top Gainer",
      value: best.symbol,
      sub: formatPrice(best.price, currency),
      change: best.h24,
    });
  }
  if (worst && worst !== best) {
    cards.push({
      label: "Top Loser",
      value: worst.symbol,
      sub: formatPrice(worst.price, currency),
      change: worst.h24,
    });
  }

  return cards;
}

export function MarketSnapshot() {
  const ticker = useMarketTicker();
  const { currency } = useCurrency();
  const snapshot = buildSnapshot(ticker, currency);

  return (
    <section aria-label="Market snapshot" className="border-y border-border bg-surface-cool">
      <div className="container-page py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {snapshot.map((s) => (
            <div
              key={s.label}
              className="card-lift rounded-sm border border-border bg-card p-3.5 shadow-card"
            >
              <p className="kicker text-muted-foreground">{s.label}</p>
              <p className="tabular mt-2 text-[21px] font-bold leading-none text-ink">{s.value}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="tabular text-[12px] text-muted-foreground">{s.sub}</span>
                <Delta value={s.change} variant="badge" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SiteLink
            target={labelLink("Market Heatmap")}
            className="rounded-sm border border-ink px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Market Heatmap
          </SiteLink>
          <SiteLink
            target={labelLink("View all markets")}
            className="text-[13px] font-semibold text-primary-hover hover:underline"
          >
            View all markets →
          </SiteLink>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="container-page flex items-center gap-3 py-3">
          <span className="kicker shrink-0 text-muted-foreground">Trending now</span>
          <div className="scroll-x min-w-0 flex-1">
            <ul className="flex gap-2 whitespace-nowrap">
              {trendingTopics.map((t) => (
                <li key={t}>
                  <SiteLink
                    target={labelLink(t.replace(/^#/, ""))}
                    className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary-hover"
                  >
                    {t}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
