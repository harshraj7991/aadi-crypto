import { useMemo, useState } from "react";
import { assets, type MarketAsset, type Sector } from "@/data/markets-demo";
import type { MarketPage } from "@/data/markets-nav";
import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import { useCurrency } from "./currency";
import { Delta, Sparkline } from "./Delta";
import { labelLink, SiteLink } from "./links";

type Extra = { label: string; render: (a: MarketAsset) => React.ReactNode; align?: "right" };

const num = (v: number, d = 2) => v.toFixed(d);

function rating(a: MarketAsset) {
  if (a.rsi >= 72 && a.d7 > 0) return "Strong buy";
  if (a.rsi >= 58) return "Buy";
  if (a.rsi <= 28) return "Strong sell";
  if (a.rsi <= 42) return "Sell";
  return "Neutral";
}

const sectorMap: Record<string, Sector> = {
  "layer-1": "Layer 1",
  "layer-2": "Layer 2",
  defi: "DeFi",
  stablecoins: "Stablecoins",
  memecoins: "Memecoins",
  ai: "AI",
  rwa: "RWA",
  depin: "DePIN",
  gaming: "Gaming",
  nft: "NFT",
  "exchange-tokens": "Exchange Tokens",
  "privacy-coins": "Privacy Coins",
  oracle: "Oracle",
  storage: "Storage",
  interoperability: "Interoperability",
  "liquid-staking": "Liquid Staking",
  restaking: "Restaking",
};

const globalMap: Record<string, (a: MarketAsset) => boolean> = {
  "bitcoin-market": (a) => a.symbol === "BTC",
  "ethereum-market": (a) => a.symbol === "ETH",
  "altcoin-market": (a) => a.symbol !== "BTC" && a.sector !== "Stablecoins",
  "stablecoin-market": (a) => a.sector === "Stablecoins",
  "defi-market": (a) => a.sector === "DeFi",
  "memecoin-market": (a) => a.sector === "Memecoins",
  "rwa-market": (a) => a.sector === "RWA",
  "ai-crypto-market": (a) => a.sector === "AI",
  "layer-1-market": (a) => a.sector === "Layer 1",
  "layer-2-market": (a) => a.sector === "Layer 2",
  "gaming-and-gamefi": (a) => a.sector === "Gaming",
  "depin-market": (a) => a.sector === "DePIN",
};

const pctExtra = (label: string, get: (a: MarketAsset) => number): Extra => ({
  label,
  align: "right",
  render: (a) => <Delta value={get(a)} className="text-[13px]" />,
});

/** Filter, sort and focus columns for a markets page. Pure config, easy to swap for live data. */
export function tableConfig(page: MarketPage): {
  rows: MarketAsset[];
  extras: Extra[];
  note: string;
} {
  const key = page.path.replace(/^\/markets\/?/, "");
  const last = key.split("/").pop() ?? "";
  let rows = assets;
  let extras: Extra[] = [];
  let note = "Ranked by market capitalisation.";

  const usd = (get: (a: MarketAsset) => number, label: string): Extra => ({
    label,
    align: "right",
    render: (a) => <UsdCell value={get(a)} />,
  });

  const bySector = sectorMap[last];
  if (key.startsWith("sectors/") && bySector) {
    rows = assets.filter((a) => a.sector === bySector);
    note = `${bySector} sector constituents, ranked by market capitalisation.`;
  } else if (key.startsWith("global/") && globalMap[last]) {
    rows = assets.filter(globalMap[last]!);
    note = "Segment constituents, ranked by market capitalisation.";
  } else if (last === "top-gainers") {
    rows = [...assets].sort((a, b) => b.h24 - a.h24).slice(0, 25);
    note = "Largest 24-hour gains across tracked assets.";
  } else if (last === "top-losers") {
    rows = [...assets].sort((a, b) => a.h24 - b.h24).slice(0, 25);
    note = "Largest 24-hour declines across tracked assets.";
  } else if (last === "buy-dominant") {
    rows = assets.filter((a) => a.buyPressure >= 58).sort((a, b) => b.buyPressure - a.buyPressure);
    extras = [
      { label: "Buy pressure", align: "right", render: (a) => <Pressure value={a.buyPressure} /> },
      { label: "Long/short", align: "right", render: (a) => <span className="tabular">{num(a.longShort)}</span> },
    ];
    note =
      "Assets with unusually strong buy-side activity, scored from taker buy ratio, order-book depth and trade flow. This does not mean every order is a buy.";
  } else if (last === "sell-dominant") {
    rows = assets.filter((a) => a.buyPressure <= 46).sort((a, b) => a.buyPressure - b.buyPressure);
    extras = [
      { label: "Sell pressure", align: "right", render: (a) => <Pressure value={100 - a.buyPressure} tone="down" /> },
      { label: "Long/short", align: "right", render: (a) => <span className="tabular">{num(a.longShort)}</span> },
    ];
    note =
      "Assets with unusually strong sell-side activity, scored from taker sell ratio, order-book depth and trade flow. This does not mean every order is a sell.";
  } else if (last === "52-week-high") {
    rows = [...assets].sort((a, b) => b.price / b.high52 - a.price / a.high52).slice(0, 25);
    extras = [usd((a) => a.high52, "52W high"), pctExtra("From high", (a) => ((a.price - a.high52) / a.high52) * 100)];
    note = "Assets trading closest to their 52-week high.";
  } else if (last === "52-week-low") {
    rows = [...assets].sort((a, b) => a.price / a.low52 - b.price / b.low52).slice(0, 25);
    extras = [usd((a) => a.low52, "52W low"), pctExtra("From low", (a) => ((a.price - a.low52) / a.low52) * 100)];
    note = "Assets trading closest to their 52-week low.";
  } else if (last === "all-time-high-watch") {
    rows = [...assets].sort((a, b) => b.fromAth - a.fromAth).slice(0, 25);
    extras = [pctExtra("From ATH", (a) => a.fromAth)];
    note = "Assets within reach of their all-time high.";
  } else if (last === "all-time-low-watch") {
    rows = [...assets].sort((a, b) => a.fromAtl - b.fromAtl).slice(0, 25);
    extras = [pctExtra("Above ATL", (a) => a.fromAtl)];
    note = "Assets closest to their all-time low.";
  } else if (last === "price-shockers") {
    rows = [...assets].sort((a, b) => Math.abs(b.h1) - Math.abs(a.h1)).slice(0, 25);
    extras = [{ label: "30d volatility", align: "right", render: (a) => <span className="tabular">{num(a.volatility30)}%</span> }];
    note = "Sudden short-term moves relative to normal volatility.";
  } else if (last === "volume-shockers" || last === "volume-screener") {
    rows = [...assets].sort((a, b) => b.volumeChange - a.volumeChange).slice(0, 25);
    extras = [pctExtra("Volume change", (a) => a.volumeChange)];
    note = "Assets trading far above their usual volume.";
  } else if (last === "most-active") {
    rows = [...assets].sort((a, b) => b.volume - a.volume).slice(0, 25);
    note = "Highest 24-hour traded value.";
  } else if (["trending", "most-searched", "most-watched", "social-trending", "developer-trending"].includes(last)) {
    rows = [...assets].sort((a, b) => b.trendScore - a.trendScore).slice(0, 20);
    extras = [{ label: "Interest score", align: "right", render: (a) => <span className="tabular">{a.trendScore}</span> }];
    note = "Ranked by a blended interest score: searches, watchlist adds, trading and social activity.";
  } else if (["new-listings", "recently-listed", "upcoming-listings", "token-launches", "token-generation-events", "ico-ido-ieo", "launchpads", "delistings"].includes(last)) {
    rows = [...assets].sort((a, b) => a.listedDaysAgo - b.listedDaysAgo).slice(0, 20);
    extras = [{ label: "Listed", align: "right", render: (a) => <span className="tabular">{a.listedDaysAgo}d ago</span> }];
    note = "Most recent additions to the tracked universe.";
  } else if (key.startsWith("technical")) {
    const rsiSort: Record<string, (a: MarketAsset, b: MarketAsset) => number> = {
      overbought: (a, b) => b.rsi - a.rsi,
      "rsi-leaders": (a, b) => b.rsi - a.rsi,
      oversold: (a, b) => a.rsi - b.rsi,
      "bullish-coins": (a, b) => b.trendScore - a.trendScore,
      "bearish-coins": (a, b) => a.trendScore - b.trendScore,
      "volatility-leaders": (a, b) => b.volatility30 - a.volatility30,
    };
    rows = [...assets].sort(rsiSort[last] ?? ((a, b) => b.trendScore - a.trendScore)).slice(0, 25);
    extras = [
      { label: "RSI 14", align: "right", render: (a) => <span className="tabular">{a.rsi}</span> },
      { label: "Rating", align: "right", render: (a) => <Rating label={rating(a)} /> },
      { label: "30d vol", align: "right", render: (a) => <span className="tabular">{num(a.volatility30)}%</span> },
    ];
    note = "Composite technical readings. Signals are informational, not investment advice.";
  } else if (
    key.startsWith("open-interest") ||
    ["oi-gainers", "oi-losers", "funding-rates", "positive-funding", "negative-funding", "long-short-ratio", "liquidations", "long-liquidations", "short-liquidations", "futures-basis", "options-market", "put-call-ratio", "max-pain", "derivatives-screener"].includes(last)
  ) {
    const sorters: Record<string, (a: MarketAsset, b: MarketAsset) => number> = {
      "oi-gainers": (a, b) => b.oiChange24 - a.oiChange24,
      "oi-losers": (a, b) => a.oiChange24 - b.oiChange24,
      "positive-funding": (a, b) => b.funding - a.funding,
      "negative-funding": (a, b) => a.funding - b.funding,
      liquidations: (a, b) => b.liquidations24 - a.liquidations24,
      "long-liquidations": (a, b) => b.liquidations24 - a.liquidations24,
      "short-liquidations": (a, b) => b.liquidations24 - a.liquidations24,
      "long-short-ratio": (a, b) => b.longShort - a.longShort,
    };
    rows = [...assets].sort(sorters[last] ?? ((a, b) => b.openInterest - a.openInterest)).slice(0, 25);
    extras = [
      usd((a) => a.openInterest, "Open interest"),
      pctExtra("OI 24h", (a) => a.oiChange24),
      { label: "Funding 8h", align: "right", render: (a) => <Delta value={a.funding} className="text-[13px]" /> },
      usd((a) => a.liquidations24, "Liquidations 24h"),
    ];
    note = "Perpetual and futures positioning aggregated across major venues.";
  } else if (key.startsWith("screener")) {
    rows = assets;
    extras = [
      { label: "RSI 14", align: "right", render: (a) => <span className="tabular">{a.rsi}</span> },
      pctExtra("Volume change", (a) => a.volumeChange),
      usd((a) => a.openInterest, "Open interest"),
    ];
    note = "Filter the universe below. Saved screens arrive with accounts.";
  } else if (key.startsWith("stablecoins")) {
    rows = assets.filter((a) => a.sector === "Stablecoins");
    extras = [usd((a) => a.supply * a.price, "Supply value")];
    note = "Stablecoin supply, dominance and peg behaviour.";
  }

  return { rows, extras, note };
}

function UsdCell({ value }: { value: number }) {
  const { currency } = useCurrency();
  return <span className="tabular">{formatCompact(value, currency)}</span>;
}

function Pressure({ value, tone = "up" }: { value: number; tone?: "up" | "down" }) {
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-cool sm:block">
        <span
          className={`block h-full ${tone === "up" ? "bg-positive" : "bg-negative"}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="tabular font-semibold text-ink">{value}</span>
    </span>
  );
}

function Rating({ label }: { label: string }) {
  const tone = label.includes("buy")
    ? "bg-positive-tint text-positive"
    : label.includes("sell")
      ? "bg-negative-tint text-negative"
      : "bg-surface-cool text-muted-foreground";
  return <span className={`rounded-sm px-1.5 py-0.5 text-[11.5px] font-semibold uppercase ${tone}`}>{label}</span>;
}

export function AssetTable({ page }: { page: MarketPage }) {
  const { currency } = useCurrency();
  const { rows, extras, note } = useMemo(() => tableConfig(page), [page]);
  const [query, setQuery] = useState("");

  const visible = rows.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">{note}</p>
        <label className="text-[13px]">
          <span className="sr-only">Filter assets</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter assets"
            className="w-44 rounded-sm border border-border bg-background px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="scroll-x mt-3">
        <table className="w-full min-w-[900px] border-collapse text-[13.5px]">
          <caption className="sr-only">{page.label} — demo market data</caption>
          <thead>
            <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="w-10 py-2.5 pl-1 font-semibold">#</th>
              <th scope="col" className="py-2.5 font-semibold">Asset</th>
              <th scope="col" className="py-2.5 text-right font-semibold">Price</th>
              <th scope="col" className="py-2.5 text-right font-semibold">1h</th>
              <th scope="col" className="py-2.5 text-right font-semibold">24h</th>
              <th scope="col" className="py-2.5 text-right font-semibold">7d</th>
              <th scope="col" className="py-2.5 text-right font-semibold">24h volume</th>
              <th scope="col" className="py-2.5 text-right font-semibold">Market cap</th>
              {extras.map((e) => (
                <th key={e.label} scope="col" className="py-2.5 text-right font-semibold">
                  {e.label}
                </th>
              ))}
              <th scope="col" className="py-2.5 pl-6 font-semibold">7D</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.symbol} className="border-b border-border transition-colors hover:bg-surface">
                <td className="tabular py-3 pl-1 text-muted-foreground">{a.rank}</td>
                <td className="py-3">
                  <SiteLink target={labelLink(a.name)} className="group flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-cool text-[10px] font-bold text-ink">
                      {a.symbol.slice(0, 3)}
                    </span>
                    <span className="font-semibold text-ink group-hover:text-primary-hover">{a.name}</span>
                    <span className="text-muted-foreground">{a.symbol}</span>
                  </SiteLink>
                </td>
                <td className="tabular py-3 text-right font-semibold text-ink">{formatPrice(a.price, currency)}</td>
                <td className="py-3 text-right"><Delta value={a.h1} className="text-[13px]" /></td>
                <td className="py-3 text-right"><Delta value={a.h24} className="text-[13px]" /></td>
                <td className="py-3 text-right"><Delta value={a.d7} className="text-[13px]" /></td>
                <td className="tabular py-3 text-right text-muted-foreground">{formatCompact(a.volume, currency)}</td>
                <td className="tabular py-3 text-right text-ink">{formatCompact(a.marketCap, currency)}</td>
                {extras.map((e) => (
                  <td key={e.label} className="py-3 text-right text-ink">
                    {e.render(a)}
                  </td>
                ))}
                <td className="py-3 pl-6"><Sparkline points={a.spark} up={a.d7 >= 0} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No assets match this view yet.</p>
      )}
      <p className="mt-3 text-[12.5px] text-muted-foreground">
        Percentages shown as {formatPercent(1.23)} style values. Prices in {currency}.
      </p>
    </section>
  );
}
