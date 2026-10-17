import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCategory } from "@/data/taxonomy";
import { fetchArticles, fetchCategory } from "@/lib/news-fn";
import { LeadStory, StoryCard } from "@/components/site/ArticleCards";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/news/$category/")({
  loader: async ({ params }) => {
    // Our own taxonomy first, because it carries the editorial blurb. Editors
    // also create categories of their own, so fall back to asking WordPress
    // rather than 404ing a desk that genuinely exists.
    const known = findCategory(params.category);
    const title = known?.title ?? (await fetchCategory({ data: params.category }))?.name;
    if (!title) throw notFound();

    const feed = await fetchArticles({ data: { categorySlug: params.category } });
    return {
      title,
      blurb: known?.blurb ?? "",
      subcategories: known?.subcategories.map((s) => s.title) ?? [],
      feed,
    };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Desk not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — AadiCrypto`;
    const description =
      loaderData.blurb || `${loaderData.title} news and analysis from AadiCrypto.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.feed.articles.length > 0
          ? []
          : [{ name: "robots", content: "noindex, follow" }]),
      ],
    };
  },

  component: CategoryPage,
});

function CategoryPage() {
  const { title, blurb, subcategories, feed } = Route.useLoaderData();

  if (feed.articles.length === 0) {
    return (
      <ComingSoonPage
        title={`The ${title} desk`}
        blurb={blurb || "Stories filed to this desk will appear here."}
        items={subcategories}
      />
    );
  }

  const [lead, ...rest] = feed.articles;
  return (
    <div className="container-page py-8">
      <header className="mb-7 border-b border-border pb-5">
        <p className="kicker text-muted-foreground">Desk</p>
        <h1 className="mt-1.5 text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold leading-tight text-ink">
          {title}
        </h1>
        {blurb && <p className="mt-2 max-w-[60ch] text-[15px] text-muted-foreground">{blurb}</p>}
      </header>
      {lead && <LeadStory article={lead} />}
      <div className="mt-8 border-t border-border">
        {rest.map((a) => (
          <StoryCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
