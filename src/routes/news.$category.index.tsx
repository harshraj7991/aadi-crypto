import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { byCategory, sortArticles, type SortKey } from "@/data/articles";
import { findCategory } from "@/data/taxonomy";
import {
  ArticleList,
  Breadcrumbs,
  ChipLinks,
  CompactList,
  HubHeader,
  LeadCard,
  SortTabs,
} from "@/components/site/ArticleBits";

export const Route = createFileRoute("/news/$category/")({
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
    const title = `${loaderData.category.title} News — AadiCrypto`;
    const description = loaderData.category.blurb;
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
  component: CategoryHub,
});

function CategoryHub() {
  const { category } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("latest");
  const list = sortArticles(byCategory(category.slug), sort);
  const [lead, ...rest] = list;
  const mostRead = sortArticles(byCategory(category.slug), "most-read").slice(0, 6);

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "News", to: "/news" },
          { label: category.title },
        ]}
      />
      <div className="mt-4">
        <HubHeader kicker="Desk" title={category.title} blurb={category.blurb} />
      </div>

      <div className="mt-4">
        <ChipLinks
          items={category.subcategories.map((s) => ({
            label: s.title,
            to: "/news/$category/$subcategory",
            params: { category: category.slug, subcategory: s.slug },
          }))}
        />
      </div>

      <div className="mt-6 grid gap-9 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SortTabs active={sort} onChange={setSort} />
          <div className="mt-6">{lead && <LeadCard article={lead} />}</div>
          <ArticleList articles={rest} />
        </div>
        <aside className="lg:col-span-4">
          <CompactList title={`Most read in ${category.title}`} articles={mostRead} />
        </aside>
      </div>
    </div>
  );
}
