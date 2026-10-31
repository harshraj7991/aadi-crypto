# AadiCrypto roadmap

## Done
- Homepage (front-end, placeholder data): header, ticker, breaking bar, news grid, market snapshot, market table, intelligence, India, research, learn, newsletter.
- Exact blueprint taxonomy (10 pillars, 40 subcategories), plus topics and coin hubs.
- Forty fictional demo stories with category, subcategory, topics, assets, format, sentiment and market impact.
- Global fictional-content notice and `noindex, nofollow` protection across the prototype.

- News section pages: /news, /news/{category}, /news/{category}/{subcategory}, article page (/news/{year}/{month}/{slug}), /topics/{slug}, /coins/{slug}, format hubs at /formats/{analysis|opinion|explainers|research}.
- Header/footer chrome lives in the shared layout, so every page has it.

## In progress
- [x] Link header, footer, homepage stories, sections and market tables to real pages.
- [x] Apply the blueprint's exact 10-pillar/40-subcategory editorial foundation and 40 clearly labeled demo stories.
- [x] Process the Markets specification into a working mega-menu, overview and focused market pages using fictional demonstration data.

## Next
- Complete article trust modules and establish taxonomy-independent canonical article URLs with redirects from existing dated links.
- Add search with the blueprint's faceted filters (category, coin, region, format, sentiment, date).
- Real backend: articles, categories, accounts, watchlists, saved stories, admin/CMS with editorial roles.
- Live market data provider instead of placeholder prices.

## Hidden for now
These are built but hidden from visitors until their content is ready. To bring one back, flip its switch or remove its name from the list in `src/data/site-features.ts`. No other code change is needed.
- Header nav links: Bitcoin, Ethereum, DeFi, ETFs, Research, Learn, Tools (`hiddenNavItems`).
- Markets mega-menu, and the Markets list in the mobile menu (`headerFeatures.markets`).
- Header buttons: Search, Watchlist, Portfolio, Notifications, Sign in (`headerFeatures.search`, `watchlist`, `portfolio`, `notifications`, `signIn`).
- Footer links: everything except Latest, Altcoins, Regulation, Prices, Movers and Exchanges (`hiddenFooterLinks`, with the reason for each). A column with no links left is hidden, so Research, Tools, Learn and Company don't show at all.
- Footer legal row: Editorial Policy, Corrections Policy, AI Policy, Privacy, Terms, Risk Disclaimer (also in `hiddenFooterLinks`). None of these pages exist yet; Privacy, Terms and Risk Disclaimer should come first.
- The pages behind these links still exist and open if someone types the URL. Only the links are hidden.
