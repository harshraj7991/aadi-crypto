import { createFileRoute } from "@tanstack/react-router";
import { fetchArticles } from "@/lib/news-fn";
import { NewsList } from "@/components/site/NewsList";

const title = "Crypto News — AadiCrypto";
const description =
  "Markets, coins, DeFi, stablecoins, regulation, institutions and India-first crypto coverage.";

export const Route = createFileRoute("/news/")({
  // No search params on purpose: /news is always page one, and later pages
  // live at /news/page/{n}. See the note in NewsList.
  loader: () => fetchArticles({ data: { page: 1 } }),
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      // Nothing published yet means nothing worth indexing yet.
      ...(loaderData && loaderData.articles.length > 0
        ? []
        : [{ name: "robots", content: "noindex, follow" }]),
    ],
  }),
  component: NewsIndex,
});

function NewsIndex() {
  return <NewsList feed={Route.useLoaderData()} page={1} />;
}
