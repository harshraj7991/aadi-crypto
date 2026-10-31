import logo from "@/assets/aadicrypto-mark-light.svg";
import { labelLink, SiteLink } from "./links";
import { hiddenFooterLinks } from "@/data/site-features";

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

const visibleColumns = columns
  .map((col) => ({ ...col, links: col.links.filter((l) => !hiddenFooterLinks.has(l)) }))
  .filter((col) => col.links.length > 0);

const legal = [
  "Editorial Policy",
  "Corrections Policy",
  "AI Policy",
  "Privacy",
  "Terms",
  "Risk Disclaimer",
].filter((l) => !hiddenFooterLinks.has(l));

/**
 * Brand on the left, link columns grouped on the right. The columns sit in a
 * flex row rather than a fixed six-track grid, so hiding links never leaves
 * empty tracks stranding the rest mid-page.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink text-background">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
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
              <span className="text-[17px]">
                <span className="font-extrabold">Aadi</span>{" "}
                <span className="font-medium">Crypto</span>
              </span>
            </div>
            <p className="mt-3 max-w-[38ch] text-[13.5px] leading-relaxed text-background/70">
              Crypto news, markets and intelligence. Everything happening in crypto, understood in
              one place — with an India-first perspective.
            </p>
          </div>

          {visibleColumns.length > 0 && (
            <nav aria-label="Footer" className="flex flex-wrap gap-x-16 gap-y-8 lg:gap-x-24">
              {visibleColumns.map((col) => (
                <div key={col.title} className="min-w-[7rem]">
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
          )}
        </div>

        <div className="mt-9 border-t border-background/15 pt-5">
          {legal.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
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
          )}
          <p className="max-w-[90ch] text-[12px] leading-relaxed text-background/60">
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
