import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { bySubcategory, sortArticles, type SortKey } from "@/data/articles";
import { findCategory, findSubcategory } from "@/data/taxonomy";
import {
  ArticleList,
  Breadcrumbs,
  ChipLinks,
  HubHeader,
  SortTabs,
} from "@/components/site/ArticleBits";

export const Route = createFileRoute("/news/$category/$subcategory/")({
  loader: ({ params }) => {
    const category = findCategory(params.category);
    const subcategory = category ? findSubcategory(category, params.subcategory) : undefined;
    if (!category || !subcategory) throw notFound();
    return { category, subcategory };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Section not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.subcategory.title} — ${loaderData.category.title} News | AadiCrypto`;
    const description = `${loaderData.subcategory.title} coverage from the AadiCrypto ${loaderData.category.title} desk.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SubcategoryHub,
});

function SubcategoryHub() {
  const { category, subcategory } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("latest");
  const list = sortArticles(bySubcategory(category.slug, subcategory.slug), sort);

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "News", to: "/news" },
          { label: category.title, to: "/news/$category", params: { category: category.slug } },
          { label: subcategory.title },
        ]}
      />
      <div className="mt-4">
        <HubHeader
          kicker={category.title}
          title={subcategory.title}
          blurb={`Everything filed under ${subcategory.title} on the ${category.title} desk.`}
        />
      </div>

      <div className="mt-4">
        <ChipLinks
          items={category.subcategories
            .filter((s) => s.slug !== subcategory.slug)
            .map((s) => ({
              label: s.title,
              to: "/news/$category/$subcategory",
              params: { category: category.slug, subcategory: s.slug },
            }))}
        />
      </div>

      <div className="mt-6 max-w-4xl">
        <SortTabs active={sort} onChange={setSort} />
        <div className="mt-2">
          <ArticleList articles={list} />
        </div>
      </div>
    </div>
  );
}
