import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findArticle, formatLabels, relatedArticles } from "@/data/articles";
import { findCategory } from "@/data/taxonomy";
import { ArticleList, Breadcrumbs, FormatBadge } from "@/components/site/ArticleBits";

export const Route = createFileRoute("/news/$category/$subcategory/$slug")({
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article || article.year !== params.category || article.month !== params.subcategory) {
      throw notFound();
    }
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Story not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    const title = `${article.headline} | AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: article.standfirst },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: article.headline },
        { property: "og:description", content: article.standfirst },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const category = findCategory(article.category);
  const sub = category?.subcategories.find((s) => s.slug === article.subcategory);
  const related = relatedArticles(article);

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "News", to: "/news" },
          ...(category
            ? [
                {
                  label: category.title,
                  to: "/news/$category",
                  params: { category: category.slug },
                },
              ]
            : []),
          ...(category && sub
            ? [
                {
                  label: sub.title,
                  to: "/news/$category/$subcategory",
                  params: { category: category.slug, subcategory: sub.slug },
                },
              ]
            : []),
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="max-w-[70ch]">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <span className="kicker text-primary-hover">
              {sub?.title ?? category?.title ?? "News"}
            </span>
            <FormatBadge article={article} />
            <span className="tabular">{article.published}</span>
          </div>

          <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.9rem)] font-extrabold leading-tight text-ink">
            {article.headline}
          </h1>
          <p className="mt-3 text-[18px] leading-relaxed text-muted-foreground">
            {article.standfirst}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-border py-3 text-[13px]">
            <span className="font-semibold text-ink">By {article.author}</span>
            <span className="text-muted-foreground">{article.authorRole}</span>
            <span className="text-muted-foreground">· {article.readingTime} min read</span>
            <span className="text-muted-foreground">· {formatLabels[article.format]}</span>
          </div>

          {article.image && (
            <img
              src={article.image}
              alt=""
              width={1024}
              height={576}
              className="mt-5 aspect-[16/9] w-full rounded-md border border-border object-cover"
            />
          )}

          {article.keyTakeaways.length > 0 && (
            <aside className="mt-6 rounded-md border border-border bg-accent/60 p-4">
              <h2 className="kicker text-primary-hover">Key takeaways</h2>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-ink">
                {article.keyTakeaways.map((k) => (
                  <li key={k} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="mt-6 space-y-4 text-[17px] leading-[1.7] text-ink">
            {article.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {article.topics.map((t) => (
              <Link
                key={t}
                to="/topics/$slug"
                params={{ slug: t }}
                className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary-hover"
              >
                #{t}
              </Link>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <section>
            <h2 className="border-b-2 border-ink pb-2 text-[15px] font-extrabold uppercase tracking-wide text-ink">
              Related stories
            </h2>
            <ArticleList articles={related} />
          </section>
        </aside>
      </div>
    </div>
  );
}
