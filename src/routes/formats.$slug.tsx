import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { byFormat, sortArticles, type ContentFormat, type SortKey } from "@/data/articles";
import { contentFormats } from "@/data/taxonomy";
import {
  ArticleList,
  Breadcrumbs,
  ChipLinks,
  HubHeader,
  SortTabs,
} from "@/components/site/ArticleBits";

const formatMap: Record<string, { title: string; blurb: string; formats: ContentFormat[] }> = {
  analysis: {
    title: "Analysis",
    blurb: "What the day's moves and filings actually mean, from the AadiCrypto desks.",
    formats: ["analysis"],
  },
  opinion: {
    title: "Opinion",
    blurb: "Argument and commentary from our columnists and outside contributors.",
    formats: ["opinion"],
  },
  explainers: {
    title: "Explainers",
    blurb: "Plain-language guides to the mechanics behind the headlines.",
    formats: ["explainer"],
  },
  research: {
    title: "Research",
    blurb: "Longer data-led work: market structure, on-chain studies and interviews.",
    formats: ["research", "interview"],
  },
};

export const Route = createFileRoute("/formats/$slug")({
  loader: ({ params }) => {
    const hub = formatMap[params.slug];
    if (!hub) throw notFound();
    return { hub, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Section not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.hub.title} | AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.hub.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.hub.blurb },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: FormatHub,
});

function FormatHub() {
  const { hub, slug } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("latest");
  const list = sortArticles(byFormat(hub.formats), sort);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: hub.title }]} />
      <div className="mt-4">
        <HubHeader kicker="Sections" title={hub.title} blurb={hub.blurb} />
      </div>
      <div className="mt-4">
        <ChipLinks
          items={contentFormats
            .filter((f) => f.slug !== slug)
            .map((f) => ({ label: f.title, to: "/formats/$slug", params: { slug: f.slug } }))}
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
