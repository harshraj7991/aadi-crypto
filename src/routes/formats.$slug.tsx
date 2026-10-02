import { createFileRoute, notFound } from "@tanstack/react-router";
import { contentFormats } from "@/data/taxonomy";
import { ComingSoonPage } from "@/components/site/ComingSoon";

const BLURBS: Record<string, string> = {
  analysis: "Market analysis that explains what moved, why it moved, and what it changes.",
  opinion: "Argued positions from named writers, clearly separated from reporting.",
  explainers: "Plain-English answers to the questions people actually ask about crypto.",
  research: "Longer-form work: data studies, sector deep dives and original analysis.",
};

export const Route = createFileRoute("/formats/$slug")({
  loader: ({ params }) => {
    const format = contentFormats.find((f) => f.slug === params.slug);
    if (!format) throw notFound();
    return { format };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Section not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.format.title} — AadiCrypto`;
    const description = BLURBS[loaderData.format.slug] ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: FormatComingSoon,
});

function FormatComingSoon() {
  const { format } = Route.useLoaderData();
  return (
    <ComingSoonPage
      title={format.title}
      blurb={BLURBS[format.slug] ?? "This section opens once the newsroom is live."}
    />
  );
}
