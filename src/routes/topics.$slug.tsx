import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { byTopic, sortArticles, type SortKey } from "@/data/articles";
import { findTopic, topics } from "@/data/taxonomy";
import {
  ArticleList,
  Breadcrumbs,
  ChipLinks,
  HubHeader,
  SortTabs,
} from "@/components/site/ArticleBits";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = findTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Topic not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.topic.title} News & Analysis | AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.topic.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.topic.blurb },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TopicHub,
});

function TopicHub() {
  const { topic } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("latest");
  const list = sortArticles(byTopic(topic.slug), sort);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Topics" }, { label: topic.title }]} />
      <div className="mt-4">
        <HubHeader kicker="Topic" title={topic.title} blurb={topic.blurb} />
      </div>
      <div className="mt-4">
        <ChipLinks
          items={topics
            .filter((t) => t.slug !== topic.slug)
            .map((t) => ({ label: t.title, to: "/topics/$slug", params: { slug: t.slug } }))}
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
