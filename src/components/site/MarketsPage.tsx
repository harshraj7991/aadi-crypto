import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Database, Landmark, Search, TrendingUp } from "lucide-react";
import { AssetTable } from "./MarketsTable";
import { Delta } from "./Delta";
import { useCurrency } from "./currency";
import {
  breadth,
  etfFunds,
  globalStatsCards,
  holders,
  indexRows,
  marketEvents,
  researchNotes,
} from "@/data/markets-demo";
import { marketPages, siblingPages, type MarketPage } from "@/data/markets-nav";
import { formatCompact } from "@/lib/format";

const marketOverview = marketPages["/markets"];

export function MarketsPage({ page = marketOverview }: { page?: MarketPage }) {
  if (!page) return null;
  const siblings = siblingPages(page).slice(0, 12);

  return (
    <div className="container-page py-7 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[12px] font-medium text-muted-foreground">
        <Link to="/" className="hover:text-primary-hover">Home</Link>
        <span aria-hidden="true"> / </span>
        {page.path === "/markets" ? (
          <span className="text-ink">Markets</span>
        ) : (
          <>
            <Link to="/markets" className="hover:text-primary-hover">Markets</Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink">{page.label}</span>
          </>
        )}
      </nav>

      <header className="mt-5 border-b border-border pb-6">
        <p className="kicker text-primary">{page.heading}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold text-ink md:text-4xl">{page.label}</h1>
            <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
              {page.blurb ?? descriptionFor(page)}
            </p>
          </div>
          <div className="rounded-sm border border-border bg-surface-cool px-3 py-2 text-[12px] font-semibold text-muted-foreground">
            Fictional demonstration data
          </div>
        </div>
      </header>

      {page.view === "overview" && <Overview />}
      {page.view === "calendar" && <CalendarView />}
      {page.view === "etf" && <EtfView />}
      {page.view === "whales" && <HoldingsView />}
      {page.view === "indexes" && <IndexesView />}
      {page.view === "research" && <ResearchView />}
      {!(["overview", "calendar", "etf", "whales", "indexes", "research"] as const).includes(
        page.view as "overview",
      ) && <AssetTable page={page} />}

      {siblings.length > 0 && (
        <section className="mt-10 border-t border-border pt-6" aria-labelledby="related-market-views">
          <h2 id="related-market-views" className="text-lg font-bold text-ink">More in {page.heading}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblings.map((item) => (
              <Link
                key={item.path}
                to={item.path as never}
                className="rounded-sm border border-border bg-background px-3 py-2 text-[13px] font-semibold text-ink hover:border-primary hover:text-primary-hover"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function descriptionFor(page: MarketPage) {
  const descriptions = {
    movers: "Compare leaders, laggards, activity and price extremes across the tracked crypto universe.",
    technical: "Scan momentum, trend, volatility and technical signals across major digital assets.",
    derivatives: "Monitor open interest, funding, positioning and liquidations across major derivatives venues.",
    sectors: "Compare crypto sectors and their constituents using consistent market measures.",
    calendar: "Track macro releases, protocol milestones, unlocks and market-moving dates.",
    activity: "Review exchange flows, large transactions and notable wallet activity.",
    onchain: "Inspect network activity, supply, valuation and exchange-reserve indicators.",
    stablecoins: "Track supply, flows, dominance and peg conditions across major stablecoins.",
  } as const;
  return descriptions[page.view as keyof typeof descriptions] ??
    "Explore a focused view of crypto prices, liquidity, positioning and market structure.";
}

function Overview() {
  const overview = marketOverview;
  if (!overview) return null;
  const total = breadth.advancing + breadth.declining + breadth.unchanged;

  return (
    <>
      <section aria-label="Global market statistics" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {globalStatsCards.map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-4 shadow-card">
            <p className="text-[12px] font-semibold text-muted-foreground">{stat.label}</p>
            <p className="tabular mt-2 text-xl font-bold text-ink">{stat.value}</p>
            <div className="mt-1">{stat.change === null ? <span className="text-xs text-muted-foreground">Composite reading</span> : <Delta value={stat.change} className="text-xs" />}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-5 border-y border-border py-5 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="kicker text-muted-foreground">Market breadth</p>
          <p className="mt-2 text-2xl font-bold text-ink">{breadth.advancing} advancing</p>
          <p className="mt-1 text-sm text-muted-foreground">of {total.toLocaleString("en-US")} tracked assets</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border border-border">
          <BreadthMetric label="Advancing" value={breadth.advancing} tone="text-positive" />
          <BreadthMetric label="Declining" value={breadth.declining} tone="text-negative" />
          <BreadthMetric label="Unchanged" value={breadth.unchanged} tone="text-muted-foreground" />
        </div>
      </section>

      <AssetTable page={overview} />
    </>
  );
}

function BreadthMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="p-4 text-center"><p className={`tabular text-xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}

function CalendarView() {
  return (
    <section className="mt-6" aria-labelledby="market-calendar">
      <h2 id="market-calendar" className="flex items-center gap-2 text-lg font-bold text-ink"><CalendarDays className="h-5 w-5" />Upcoming events</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-3">Date</th><th>Event</th><th>Region</th><th>Impact</th><th>Details</th></tr></thead>
          <tbody>{marketEvents.map((event) => <tr key={`${event.date}-${event.title}`} className="border-b border-border"><td className="tabular py-3 font-semibold text-ink">{event.date} · {event.time}</td><td className="font-semibold text-ink">{event.title}</td><td>{event.region}</td><td><Impact value={event.impact} /></td><td className="text-muted-foreground">{event.detail}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function Impact({ value }: { value: "High" | "Medium" | "Low" }) {
  const tone = value === "High" ? "bg-negative-tint text-negative" : value === "Medium" ? "bg-surface text-ink" : "bg-surface-cool text-muted-foreground";
  return <span className={`rounded-sm px-2 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
}

function EtfView() {
  const { currency } = useCurrency();
  return <DataSection icon={Landmark} title="Fund flows and assets"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-3">Fund</th><th>Asset</th><th className="text-right">AUM</th><th className="text-right">24h flow</th><th className="text-right">7d flow</th><th className="text-right">Fee</th></tr></thead><tbody>{etfFunds.map((fund) => <tr key={fund.ticker} className="border-b border-border"><td className="py-3"><strong className="text-ink">{fund.name}</strong><span className="ml-2 text-muted-foreground">{fund.ticker}</span></td><td>{fund.asset}</td><td className="tabular text-right">{formatCompact(fund.aum, currency)}</td><td className="text-right"><Delta value={fund.flow24 / 1_000_000} className="text-xs" /></td><td className="text-right"><Delta value={fund.flow7 / 1_000_000} className="text-xs" /></td><td className="tabular text-right">{fund.fee.toFixed(2)}%</td></tr>)}</tbody></table></DataSection>;
}

function HoldingsView() {
  const { currency } = useCurrency();
  return <DataSection icon={Database} title="Tracked holdings"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-3">Holder</th><th>Type</th><th>Asset</th><th>Holding</th><th className="text-right">Value</th><th className="text-right">30d</th></tr></thead><tbody>{holders.map((holder) => <tr key={holder.name} className="border-b border-border"><td className="py-3 font-semibold text-ink">{holder.name}</td><td>{holder.type}</td><td>{holder.asset}</td><td>{holder.holding}</td><td className="tabular text-right">{formatCompact(holder.value, currency)}</td><td className="text-right"><Delta value={holder.change30} className="text-xs" /></td></tr>)}</tbody></table></DataSection>;
}

function IndexesView() {
  return <DataSection icon={TrendingUp} title="AadiCrypto indexes"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-3">Index</th><th className="text-right">Level</th><th className="text-right">24h</th><th className="text-right">30d</th><th className="text-right">Assets</th></tr></thead><tbody>{indexRows.map((row) => <tr key={row.name} className="border-b border-border"><td className="py-3 font-semibold text-ink">{row.name}</td><td className="tabular text-right">{row.level.toLocaleString("en-US")}</td><td className="text-right"><Delta value={row.change24} className="text-xs" /></td><td className="text-right"><Delta value={row.change30} className="text-xs" /></td><td className="tabular text-right">{row.constituents}</td></tr>)}</tbody></table></DataSection>;
}

function ResearchView() {
  return <section className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{researchNotes.map((note) => <article key={note.title} className="border border-border bg-card p-5 shadow-card"><p className="kicker text-primary">{note.desk}</p><h2 className="mt-2 text-lg font-bold text-ink">{note.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{note.summary}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span>{note.updated}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></div></article>)}</section>;
}

function DataSection({ icon: Icon, title, children }: { icon: typeof Search; title: string; children: React.ReactNode }) {
  return <section className="mt-6"><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><Icon className="h-5 w-5" />{title}</h2><div className="mt-3 overflow-x-auto">{children}</div></section>;
}