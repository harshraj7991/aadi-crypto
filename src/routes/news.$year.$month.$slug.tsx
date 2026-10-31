import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";

import { fetchArticle } from "@/lib/news-fn";
import { Byline, timeAgo } from "@/components/site/ArticleCards";
import { ShareButton } from "@/components/site/ShareButton";

const SITE = "https://aadicrypto.com";

export const Route = createFileRoute("/news/$year/$month/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticle({ data: params.slug });
    if (!article) throw notFound();
    if (article.url === `/news/${params.year}/${params.month}/${params.slug}`) return article;

    // Not the canonical address. Two very different reasons for that:
    //
    // Stories were published under /news/{desk}/{section}/{slug} for a
    // fortnight before the move to dated URLs, and that path has the same
    // three-segment shape as this route. Anyone holding one of those links
    // gets sent to the real article instead of a dead end.
    const looksLikeADate = /^\d{4}$/.test(params.year) && /^\d{2}$/.test(params.month);
    if (!looksLikeADate) throw redirect({ to: article.url, statusCode: 301 });

    // A date-shaped prefix that is simply wrong is a wrong address. Redirecting
    // those too would let a crawler mint endless variants of every story.
    throw notFound();
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Story not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const a = loaderData;
    const image = a.image ? `${SITE}${a.image.url}` : undefined;
    // Articles cached at the edge by an older deploy have no `share` copy and
    // can be served for a while after a release. Use the main image for those,
    // as before, rather than dropping the preview image altogether.
    const share = a.image ? (a.image.share ?? a.image) : undefined;
    const description = a.subtitle || a.excerpt;

    return {
      meta: [
        { title: `${a.title} — AadiCrypto` },
        { name: "description", content: description },
        { property: "og:title", content: a.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE}${a.url}` },
        { property: "og:site_name", content: "AadiCrypto" },
        { property: "article:published_time", content: a.publishedAt },
        { property: "article:modified_time", content: a.updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
        // The light copy, so the preview shows in WhatsApp too (see ArticleImage).
        ...(share && a.image
          ? [
              { property: "og:image", content: `${SITE}${share.url}` },
              { property: "og:image:width", content: String(share.width) },
              { property: "og:image:height", content: String(share.height) },
              { property: "og:image:alt", content: a.image.alt },
            ]
          : []),
        // Crypto is a "Your Money or Your Life" subject. A story with no named
        // author is held out of search rather than published anonymously.
        ...(a.author ? [] : [{ name: "robots", content: "noindex, follow" }]),
      ],
      links: [{ rel: "canonical", href: `${SITE}${a.url}` }],
      scripts: a.author
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                headline: a.title,
                description,
                datePublished: a.publishedAt,
                dateModified: a.updatedAt,
                mainEntityOfPage: `${SITE}${a.url}`,
                author: { "@type": "Person", name: a.author.name, description: a.author.bio },
                publisher: { "@type": "Organization", name: "AadiCrypto" },
                ...(image ? { image: [image] } : {}),
                ...(a.subcategory ? { articleSection: a.subcategory.name } : {}),
              }),
            },
          ]
        : [],
    };
  },

  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();

  return (
    <div className="container-page py-8">
      <article className="mx-auto max-w-[72ch]">
        <nav
          aria-label="Breadcrumb"
          className="kicker flex flex-wrap items-center gap-x-2 text-muted-foreground"
        >
          <Link to="/news" className="hover:text-primary-hover">
            News
          </Link>
          {a.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                to="/news/$category"
                params={{ category: a.category.slug }}
                className="hover:text-primary-hover"
              >
                {a.category.name}
              </Link>
            </>
          )}
          {a.subcategory && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                to="/news/$category/$subcategory"
                params={{
                  category: (a.category ?? a.subcategory).slug,
                  subcategory: a.subcategory.slug,
                }}
                className="text-primary-hover hover:underline"
              >
                {a.subcategory.name}
              </Link>
            </>
          )}
        </nav>

        <h1 className="mt-3 text-[clamp(1.9rem,4.2vw,2.75rem)] font-extrabold leading-[1.12] text-ink">
          {a.title}
        </h1>

        {/* The standfirst editors write as the first line of the body. */}
        {a.subtitle && (
          <p className="mt-4 text-[18px] italic leading-relaxed text-[var(--color-primary-hover)]">
            {a.subtitle}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3">
          <Byline article={a} />
          <time dateTime={a.publishedAt} className="text-[13px] text-muted-foreground">
            {timeAgo(a.publishedAt)}
          </time>
          <ShareButton
            url={`${SITE}${a.url}`}
            title={a.title}
            text={a.subtitle || a.excerpt}
            className="ml-auto"
          />
        </div>

        {a.image && (
          <figure className="mt-6">
            <img
              src={a.image.url}
              alt={a.image.alt}
              width={a.image.width}
              height={a.image.height}
              className="aspect-video w-full rounded-sm bg-surface-cool object-cover"
            />
          </figure>
        )}

        {a.summary.length > 0 && (
          <section aria-labelledby="quick-summary" className="summary-box mt-7">
            <h2 id="quick-summary">Quick News Summary:</h2>
            {/* One item means the writer summarised in prose, so a lone
                bullet would look like a mistake. */}
            {a.summary.length === 1 ? (
              <p>{a.summary[0]}</p>
            ) : (
              <ul>
                {a.summary.map((point, i) => (
                  <li key={`${i}-${point.slice(0, 24)}`}>{point}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div
          className="article-body mt-7"
          // The CMS is the only writer here and WordPress sanitises on save.
          dangerouslySetInnerHTML={{ __html: a.html }}
        />

        {a.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
            {a.tags.map((t) => (
              <li
                key={t.slug}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground"
              >
                {t.name}
              </li>
            ))}
          </ul>
        )}

        {/* Financial content, so this is not optional furniture. It prints on
            every story; any copy the writer pasted into the body is stripped by
            stripDisclaimer so the reader never sees it twice. */}
        <aside className="disclaimer-box mt-8">
          <p>
            Disclaimer: AadiCrypto provides this information for educational and informational
            purposes only. It does not constitute financial, investment, trading or other
            professional advice. Always do your own research and consider your own circumstances
            before making any financial decision.
          </p>
        </aside>

        {a.author && (
          <aside className="mt-6 rounded-sm border border-border bg-surface-cool p-5">
            <p className="kicker text-muted-foreground">Written by</p>
            <p className="mt-1.5 text-[17px] font-bold text-ink">{a.author.name}</p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">
              {a.author.bio}
            </p>
          </aside>
        )}
      </article>
    </div>
  );
}
