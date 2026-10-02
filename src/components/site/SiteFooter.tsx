import logo from "@/assets/aadicrypto-logo.png";
import { labelLink, SiteLink } from "./links";

const columns: Array<{ title: string; links: string[] }> = [
  {
    title: "News",
    links: ["Latest", "Bitcoin", "Ethereum", "Altcoins", "Regulation", "India", "Security"],
  },
  {
    title: "Markets",
    links: ["Prices", "Movers", "Heatmap", "Categories", "Exchanges", "Derivatives"],
  },
  { title: "Research", links: ["Market Outlook", "On-chain", "Institutional", "Weekly Report"] },
  {
    title: "Tools",
    links: ["Converter", "Watchlist", "Portfolio", "Alerts", "Calculators", "Calendar"],
  },
  { title: "Learn", links: ["Crypto 101", "Trading Basics", "Wallet Security", "Glossary"] },
  { title: "Company", links: ["About", "Authors", "Careers", "Advertise", "Contact"] },
];

const legal = [
  "Editorial Policy",
  "Corrections Policy",
  "AI Policy",
  "Privacy",
  "Terms",
  "Risk Disclaimer",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink text-background">
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="AadiCrypto"
                loading="lazy"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-[17px] font-extrabold">
                Aadi<span className="text-[oklch(0.82_0.14_132)]">Crypto</span>
              </span>
            </div>
            <p className="mt-3 max-w-[38ch] text-[13.5px] leading-relaxed text-background/70">
              Crypto news, markets and intelligence. Everything happening in crypto, understood in
              one place — with an India-first perspective.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="kicker text-background/60">{col.title}</h2>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <SiteLink
                        target={labelLink(l)}
                        className="text-[13px] text-background/85 hover:text-background"
                      >
                        {l}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-9 border-t border-background/15 pt-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l}>
                <SiteLink
                  target={labelLink(l)}
                  className="text-[12.5px] font-semibold text-background/85 hover:text-background"
                >
                  {l}
                </SiteLink>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[90ch] text-[12px] leading-relaxed text-background/60">
            Market data is provided for information only and is not investment advice. Prices come
            from third-party providers and may be delayed or incomplete. Crypto assets are volatile
            and unregulated in many jurisdictions. AadiCrypto never asks for seed phrases or private
            keys.
          </p>
          <p className="mt-3 text-[12px] text-background/60">
            © {new Date().getFullYear()} AadiCrypto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
