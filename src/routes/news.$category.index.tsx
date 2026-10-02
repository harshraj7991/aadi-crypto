import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCategory } from "@/data/taxonomy";
import { fetchArticles } from "@/lib/news-fn";
import { LeadStory, StoryCard } from "@/components/site/ArticleCards";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/news/$category/")({
  loader: async ({ params }) => {
    const category = findCategory(params.category);
    if (!category) throw notFound();
    const feed = await fetchArticles({ data: { categorySlug: params.category } });
    return { category, feed };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Desk not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.category.title} — AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.category.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.category.blurb },
        ...(loaderData.feed.articles.length > 0
          ? []
          : [{ name: "robots", content: "noindex, follow" }]),
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, feed } = Route.useLoaderData();

  if (feed.articles.length === 0) {
    return (
      <ComingSoonPage
        title={`The ${category.title} desk`}
        blurb={category.blurb}
        items={category.subcategories.map((s) => s.title)}
      />
    );
  }

  const [lead, ...rest] = feed.articles;
  return (
    <div className="container-page py-8">
      <header className="mb-7 border-b border-border pb-5">
        <p className="kicker text-muted-foreground">Desk</p>
        <h1 className="mt-1.5 text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold leading-tight text-ink">
          {category.title}
        </h1>
        <p className="mt-2 max-w-[60ch] text-[15px] text-muted-foreground">{category.blurb}</p>
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
