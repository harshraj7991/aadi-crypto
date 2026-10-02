import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCoin } from "@/data/taxonomy";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/coins/$slug")({
  loader: ({ params }) => {
    const coin = findCoin(params.slug);
    if (!coin) throw notFound();
    return { coin };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Coin not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.coin.name} (${loaderData.coin.symbol}) — AadiCrypto`;
    const description = `${loaderData.coin.name} price, market data, news and analysis.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CoinComingSoon,
});

function CoinComingSoon() {
  const { coin } = Route.useLoaderData();
  return (
    <ComingSoonPage
      title={`${coin.name} hub`}
      blurb={`A single page for ${coin.name}: live price and chart, the metrics that matter for ${coin.symbol}, and every story filed against it. Live ${coin.symbol} pricing is already running on the home page.`}
      items={["Price & chart", "Key metrics", "News", "Research"]}
    />
  );
}
