import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCategory } from "@/data/taxonomy";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/news/$category/")({
  // The taxonomy is real even though the stories are not, so an unknown desk
  // still 404s rather than showing a placeholder for a section we never had.
  loader: ({ params }) => {
    const category = findCategory(params.category);
    if (!category) throw notFound();
    return { category };
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
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: CategoryComingSoon,
});

function CategoryComingSoon() {
  const { category } = Route.useLoaderData();
  return (
    <ComingSoonPage
      title={`The ${category.title} desk`}
      blurb={category.blurb}
      items={category.subcategories.map((sub) => sub.title)}
    />
  );
}
