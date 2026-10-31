/**
 * On/off switches for header and footer pieces not ready for visitors yet.
 *
 * Everything listed here is still built and wired up. It is only hidden from
 * the page. When a section or feature is ready, flip its switch to `true` (or
 * remove the label from `hiddenNavItems` / `hiddenFooterLinks`) and it comes
 * back as it was.
 * The same list is kept in roadmap.md under "Hidden for now".
 */

/** Header nav labels hidden on desktop and in the mobile menu. */
export const hiddenNavItems: ReadonlySet<string> = new Set([
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "ETFs",
  "Research",
  "Learn",
  "Tools",
]);

export const headerFeatures = {
  /** Markets mega-menu (desktop) and the Markets list in the mobile menu. */
  markets: false,
  search: false,
  watchlist: false,
  portfolio: false,
  notifications: false,
  signIn: false,
} as const;

export function isNavItemVisible(label: string) {
  return !hiddenNavItems.has(label);
}

/**
 * Footer links hidden until their page has real content. Kept: Latest,
 * Altcoins, Regulation, Prices, Movers and Exchanges, which all open news
 * pages with stories in WordPress. A column with nothing left to show is
 * dropped, heading and all.
 */
export const hiddenFooterLinks: ReadonlySet<string> = new Set([
  // News: Bitcoin, Ethereum and India are "Coming soon" topic pages, and
  // Security points at a category WordPress does not have yet.
  "Bitcoin",
  "Ethereum",
  "India",
  "Security",
  // Markets: Heatmap and Categories repeat Prices and Latest, and Derivatives
  // has no WordPress category yet.
  "Heatmap",
  "Categories",
  "Derivatives",
  // Research, Tools and Learn: "Coming soon" pages or no page at all.
  "Market Outlook",
  "On-chain",
  "Institutional",
  "Weekly Report",
  "Converter",
  "Watchlist",
  "Portfolio",
  "Alerts",
  "Calculators",
  "Calendar",
  "Crypto 101",
  "Trading Basics",
  "Wallet Security",
  "Glossary",
  // Company: none of these pages exist yet.
  "About",
  "Authors",
  "Careers",
  "Advertise",
  "Contact",
  // Legal row: none of these pages exist yet. Privacy, Terms and Risk
  // Disclaimer are the ones a finance site most needs; write those first.
  "Editorial Policy",
  "Corrections Policy",
  "AI Policy",
  "Privacy",
  "Terms",
  "Risk Disclaimer",
]);
