import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchArticles } from "@/lib/news-fn";
import { LeadStory, StoryCard } from "@/components/site/ArticleCards";
import { ComingSoonPage } from "@/components/site/ComingSoon";

const title = "Crypto News — AadiCrypto";
const description =
  "Markets, coins, DeFi, stablecoins, regulation, institutions and India-first crypto coverage.";

export const Route = createFileRoute("/news/")({
  // Optional so /news stays linkable without a query string — page 1 should not
  // carry ?page=1, which would split the canonical URL in two.
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Number(search["page"]);
    return Number.isFinite(page) && page > 1 ? { page } : {};
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => fetchArticles({ data: { page: deps.page } }),
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      // Nothing published yet means nothing worth indexing yet.
      ...(loaderData && loaderData.articles.length > 0
        ? []
        : [{ name: "robots", content: "noindex, follow" }]),
    ],
  }),
  component: NewsIndex,
});

function NewsIndex() {
  const { articles, totalPages, page } = Route.useLoaderData();

  if (articles.length === 0) {
    return (
      <ComingSoonPage
        title="The newsroom opens next"
        blurb="One canonical story per event, filed to a single desk and cross-listed across the coins, topics and regions it touches. Nothing is published here until it is real reporting."
        items={[
          "Markets & price action",
          "Coins & ecosystems",
          "DeFi & stablecoins",
          "Regulation & policy",
          "Institutions & ETFs",
          "India",
        ]}
      />
    );
  }

  const [lead, ...rest] = articles;

  return (
    <div className="container-page py-8">
      <header className="mb-7 border-b border-border pb-5">
        <p className="kicker text-muted-foreground">Newsroom</p>
        <h1 className="mt-1.5 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight text-ink">
          Latest crypto news
        </h1>
      </header>

      {lead && <LeadStory article={lead} />}

      <div className="mt-8 border-t border-border">
        {rest.map((article) => (
          <StoryCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <nav
      className="mt-8 flex items-center justify-between border-t border-border pt-5"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          to="/news"
          search={page - 1 > 1 ? { page: page - 1 } : {}}
          className="rounded-sm border border-border px-4 py-2 text-[13.5px] font-semibold text-ink hover:border-primary hover:text-primary-hover"
        >
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="tabular text-[13px] text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          to="/news"
          search={{ page: page + 1 }}
          className="rounded-sm border border-border px-4 py-2 text-[13.5px] font-semibold text-ink hover:border-primary hover:text-primary-hover"
        >
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
