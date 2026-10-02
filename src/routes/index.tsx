import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { MarketTable } from "@/components/site/MarketTable";
import { ComingSoon } from "@/components/site/ComingSoon";
import { HeadlineRow, LeadStory, StoryCard } from "@/components/site/ArticleCards";
import { fetchArticles } from "@/lib/news-fn";

const title = "AadiCrypto — Crypto Prices, Markets & News";
const description =
  "Live crypto prices, market capitalisation, dominance and sector movers across the top 100 coins, with India-first news and analysis.";

export const Route = createFileRoute("/")({
  loader: () => fetchArticles({ data: { page: 1 } }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/**
 * The market blocks are always real. The newsroom block shows stories once
 * there are any and says so plainly when there are not — a placeholder is
 * honest, an empty grid looks broken.
 */
function Index() {
  const { articles } = Route.useLoaderData();
  const [lead, ...rest] = articles;
  const hasNews = articles.length > 0;

  return (
    <>
      <h1 className="sr-only">AadiCrypto — crypto prices, markets and news</h1>

      {hasNews && lead && (
        <section aria-label="Latest news" className="container-page py-8">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <LeadStory article={lead} />
              <div className="mt-7 border-t border-border">
                {rest.slice(0, 4).map((a) => (
                  <StoryCard key={a.id} article={a} />
                ))}
              </div>
            </div>

            <aside className="lg:border-l lg:border-border lg:pl-7">
              <h2 className="kicker border-b border-ink pb-2 text-ink">Latest news</h2>
              <ul>
                {rest.slice(4, 12).map((a) => (
                  <HeadlineRow key={a.id} article={a} />
                ))}
              </ul>
              <Link
                to="/news"
                className="mt-4 inline-flex text-[13.5px] font-semibold text-primary-hover hover:underline"
              >
                All news →
              </Link>
            </aside>
          </div>
        </section>
      )}

      <MarketSnapshot />
      <MarketTable />

      {!hasNews && (
        <section aria-label="Newsroom" className="container-page pb-6">
          <ComingSoon
            showLink={false}
            title="The newsroom opens next"
            blurb="Markets, coins and ecosystems, DeFi and stablecoins, regulation, institutions and India-first coverage — filed to one desk and cross-listed across the coins and topics each story touches."
            items={[
              "Markets & price action",
              "Coins & ecosystems",
              "DeFi & stablecoins",
              "Regulation & policy",
              "India",
              "ETFs & institutions",
            ]}
          />
        </section>
      )}

      <section aria-label="Research, learning and accounts" className="container-page pb-14">
        <ComingSoon
          compact
          showLink={false}
          title="Research, guides and watchlists"
          blurb="On-chain intelligence, token unlock calendars, explainers and a free account to follow the coins you care about."
          items={["Research", "Learn", "Watchlists", "Newsletter", "On-chain intelligence"]}
        />
      </section>
    </>
  );
}
