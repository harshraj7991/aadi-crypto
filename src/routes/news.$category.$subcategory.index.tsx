import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCategory, findSubcategory } from "@/data/taxonomy";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/news/$category/$subcategory/")({
  loader: ({ params }) => {
    const category = findCategory(params.category);
    if (!category) throw notFound();
    const subcategory = findSubcategory(category, params.subcategory);
    if (!subcategory) throw notFound();
    return { category, subcategory };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Section not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.subcategory.title} — AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.category.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.category.blurb },
      ],
    };
  },
  component: SubcategoryComingSoon,
});

function SubcategoryComingSoon() {
  const { category, subcategory } = Route.useLoaderData();
  return (
    <ComingSoonPage
      title={subcategory.title}
      blurb={category.blurb}
      items={[`${category.title} desk`]}
    />
  );
}
