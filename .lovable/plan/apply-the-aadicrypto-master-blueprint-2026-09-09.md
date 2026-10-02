# Apply the AadiCrypto master blueprint

## Goal
Turn the current front-end prototype into the blueprint's coherent crypto newsroom foundation without breaking the working homepage, article URLs, or shared navigation.

## Phase 1 — Editorial foundation
- Replace the current eight-pillar taxonomy with the document's exact ten categories and forty subcategories.
- Preserve one canonical URL per article while allowing category, topic, coin, format, and geography discovery paths.
- Expand and normalize the sample dataset to the forty fictional stories specified in the document.
- Mark all sample stories visibly as demo content and add `noindex` metadata so they cannot be mistaken for live financial reporting.
- Update menus, category pages, topic/coin links, homepage sections, and breadcrumbs to use the revised taxonomy.

## Phase 2 — Article trust and discovery
- Complete the article template with content-type labels, source attribution, update/correction information, disclosures, related coverage, and accessible market context placeholders.
- Add working search with filters for category, asset, geography, format, sentiment, and date.
- Add dedicated latest, markets, and taxonomy discovery pages required by the document.
- Add accurate page metadata and visible-content-aligned `NewsArticle` structured data.

## Phase 3 — Reader and newsroom systems
- Enable Lovable Cloud before adding persistence.
- Add authentication, saved stories, watchlists, preferences, My Feed, alerts, and newsletter settings.
- Add the editorial CMS, roles, review/publish workflow, taxonomy management, and homepage curation with secure access rules.

## Phase 4 — Live data and publishing infrastructure
- Add server-side market-provider adapters with source/freshness labels and graceful mock/error states.
- Add publication-time market snapshots, RSS, XML and Google News sitemaps, analytics events, and admin-configurable subscriptions.
- Finish responsive, accessibility, security, SEO, and performance checks at the blueprint's target widths.

## Technical notes
- Keep TanStack Start routing and the existing semantic design tokens.
- Maintain USD as the default with the existing INR toggle.
- Treat external credentials as server-side secrets only; never ship keys to the browser.
- Implement in small validated batches, with route/type checks and browser navigation checks after each phase.

## Validation
- Type checking remains clean; the reported `src/lib/utils.ts(8,7)` error does not exist in the current file and does not reproduce.
- Every navigation target opens a real route.
- All ten categories, forty subcategories, and forty fictional articles are represented and cross-linked.
- Demo content is visibly labeled and excluded from indexing.
- Desktop, tablet, and mobile layouts remain readable with no overlap or horizontal overflow.