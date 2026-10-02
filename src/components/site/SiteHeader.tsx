import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Briefcase, Menu, Search, Star, X } from "lucide-react";
import logo from "@/assets/aadicrypto-logo.png";
import { labelLink, SiteLink, storyLink } from "./links";
import { coins, globalStats } from "@/data/market";
import { breaking } from "@/data/news";
import { formatPrice } from "@/lib/format";
import { CurrencyToggle, useCurrency } from "./currency";
import { Delta } from "./Delta";
import { MarketsMegaMenu, MarketsMobileList } from "./MarketsMegaMenu";

const primaryNav = [
  "Home",
  "News",
  "Prices",
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "ETFs",
  "Research",
  "Learn",
  "Tools",
];

const moreNav = [
  "Regulation",
  "India",
  "Stablecoins",
  "On-chain",
  "Token Unlocks",
  "Treasuries",
  "Security",
  "Gaming",
  "NFTs",
  "Web3",
  "AI & Crypto",
  "Podcasts",
  "Videos",
  "Events",
  "Glossary",
];

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      {/* Utility strip */}
      <div className="border-b border-border bg-ink text-background">
        <div className="container-page flex h-9 items-center gap-4">
          <ul className="scroll-x flex flex-1 items-center gap-5 whitespace-nowrap py-1">
            {globalStats.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5 text-[12px]">
                <span className="text-background/60">{s.label}</span>
                <span className="tabular font-semibold">{s.value}</span>
                {s.change !== null && (
                  <span
                    className={`tabular text-[11px] font-semibold ${
                      s.change >= 0 ? "text-[oklch(0.82_0.14_132)]" : "text-[oklch(0.72_0.16_28)]"
                    }`}
                  >
                    {s.change > 0 ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden shrink-0 md:block">
            <CurrencyToggle />
          </div>
        </div>
      </div>

      {/* Market ticker */}
      <Ticker />

      {/* Main header */}
      <div
        className={`z-40 border-b border-border bg-background/95 backdrop-blur ${
          stuck ? "sticky top-0 shadow-card" : ""
        }`}
      >
        <div className="container-page flex h-16 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="AadiCrypto" width={36} height={36} className="h-9 w-9" />
            <span className="text-[19px] font-extrabold tracking-tight text-ink">
              Aadi<span className="text-primary">Crypto</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 xl:block">
            <ul className="flex items-center gap-4 text-[13.5px] font-semibold">
              {primaryNav.map((item) => (
                <li key={item}>
                  <SiteLink
                    target={labelLink(item)}
                    className="border-b-2 border-transparent py-1 text-ink transition-colors hover:border-primary hover:text-primary-hover"
                  >
                    {item}
                  </SiteLink>
                </li>
              ))}
              <MarketsMegaMenu />
              <li className="relative group">
                <button className="border-b-2 border-transparent py-1 text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary-hover">
                  More
                </button>
                <div className="invisible absolute right-0 top-full z-50 w-[520px] max-w-[calc(100vw-2rem)] grid-cols-3 gap-x-6 gap-y-1 rounded-md border border-border bg-popover p-4 opacity-0 shadow-lift transition-opacity group-hover:visible group-hover:opacity-100 grid">
                  {moreNav.map((item) => (
                    <SiteLink
                      key={item}
                      target={labelLink(item)}
                      className="rounded-sm px-2 py-1.5 text-[13px] font-medium text-ink hover:bg-surface hover:text-primary-hover"
                    >
                      {item}
                    </SiteLink>
                  ))}
                </div>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <IconButton label="Search">
              <Search className="h-4.5 w-4.5" strokeWidth={1.9} />
            </IconButton>
            <IconButton label="Watchlist">
              <Star className="h-4.5 w-4.5" strokeWidth={1.9} />
            </IconButton>
            <IconButton label="Portfolio">
              <Briefcase className="h-4.5 w-4.5" strokeWidth={1.9} />
            </IconButton>
            <IconButton label="Notifications">
              <span className="relative">
                <Bell className="h-4.5 w-4.5" strokeWidth={1.9} />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            </IconButton>
            <button
              type="button"
              className="ml-2 hidden rounded-sm bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              className="ml-1 rounded-sm p-2 text-ink hover:bg-surface xl:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile" className="border-t border-border bg-background xl:hidden">
            <ul className="container-page grid grid-cols-2 gap-x-4 py-3 sm:grid-cols-3">
              {[...primaryNav, ...moreNav].map((item) => (
                <li key={item}>
                  <SiteLink
                    target={labelLink(item)}
                    className="block py-2 text-sm font-medium text-ink"
                  >
                    {item}
                  </SiteLink>
                </li>
              ))}
            </ul>
            <div className="container-page pb-4">
              <p className="kicker mb-2 text-muted-foreground">Markets</p>
              <MarketsMobileList />
            </div>
            <div className="container-page pb-4 md:hidden">
              <CurrencyToggle />
            </div>
          </nav>
        )}
      </div>

      {/* Breaking news bar */}
      <div className="border-b border-border bg-surface">
        <div className="container-page flex items-center gap-3 py-2">
          <span className="kicker shrink-0 rounded-sm bg-primary px-2 py-1 text-primary-foreground">
            Breaking
          </span>
          <div className="scroll-x min-w-0 flex-1">
            <SiteLink
              target={storyLink(breaking)}
              className="block whitespace-nowrap text-[13.5px] font-semibold text-ink hover:text-primary-hover"
            >
              {breaking}
            </SiteLink>
          </div>
          <span className="tabular hidden shrink-0 text-xs text-muted-foreground sm:block">
            Updated 12 min ago
          </span>
        </div>
      </div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="rounded-sm p-2 text-ink transition-colors hover:bg-surface hover:text-primary-hover"
    >
      {children}
    </button>
  );
}

function Ticker() {
  const { currency } = useCurrency();
  return (
    <div className="border-b border-border bg-surface-cool">
      <div className="container-page scroll-x">
        <ul className="flex items-center gap-6 whitespace-nowrap py-2">
          {coins.map((c) => (
            <li key={c.symbol} className="flex shrink-0 items-center gap-2 text-[13px]">
              <span className="font-bold text-ink">{c.symbol}</span>
              <span className="tabular text-ink">{formatPrice(c.price, currency)}</span>
              <Delta value={c.h24} className="text-xs" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
