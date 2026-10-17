import { Link } from "@tanstack/react-router";

import type { ArticlePage } from "@/types/article";
import { LeadStory, StoryCard } from "./ArticleCards";
import { ComingSoonPage } from "./ComingSoon";

/**
 * The newsroom listing, shared by /news and /news/page/{n}.
 *
 * Pagination lives in the path rather than a query string. Partly because it
 * reads better and keeps /news canonical for page one, and partly because
 * TanStack's `validateSearch` throws during SSR on a search value that is not
 * valid JSON — `?page=abc` from any crawler or scanner would 500 the page.
 */
export function NewsList({ feed, page }: { feed: ArticlePage; page: number }) {
  if (feed.articles.length === 0) {
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

  const [lead, ...rest] = feed.articles;

  return (
    <div className="container-page py-8">
      <header className="mb-7 border-b border-border pb-5">
        <p className="kicker text-muted-foreground">Newsroom</p>
        <h1 className="mt-1.5 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight text-ink">
          Latest crypto news
        </h1>
        {page > 1 && <p className="mt-1.5 text-[14px] text-muted-foreground">Page {page}</p>}
      </header>

      {lead && <LeadStory article={lead} />}

      <div className="mt-8 border-t border-border">
        {rest.map((article) => (
          <StoryCard key={article.id} article={article} />
        ))}
      </div>

      {feed.totalPages > 1 && <Pagination page={page} totalPages={feed.totalPages} />}
    </div>
  );
}

const linkClass =
  "rounded-sm border border-border px-4 py-2 text-[13.5px] font-semibold text-ink hover:border-primary hover:text-primary-hover";

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <nav
      className="mt-8 flex items-center justify-between border-t border-border pt-5"
      aria-label="Pagination"
    >
      {page > 2 ? (
        <Link to="/news/page/$page" params={{ page: String(page - 1) }} className={linkClass}>
          ← Newer
        </Link>
      ) : page === 2 ? (
        <Link to="/news" className={linkClass}>
          ← Newer
        </Link>
      ) : (
        <span />
      )}

      <span className="tabular text-[13px] text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link to="/news/page/$page" params={{ page: String(page + 1) }} className={linkClass}>
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
