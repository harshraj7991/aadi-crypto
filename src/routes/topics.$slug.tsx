import { createFileRoute, notFound } from "@tanstack/react-router";
import { findTopic } from "@/data/taxonomy";
import { ComingSoonPage } from "@/components/site/ComingSoon";

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
    const title = `${loaderData.topic.title} — AadiCrypto`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.topic.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.topic.blurb },
      ],
    };
  },
  component: TopicComingSoon,
});

function TopicComingSoon() {
  const { topic } = Route.useLoaderData();
  return <ComingSoonPage title={topic.title} blurb={topic.blurb} />;
}
