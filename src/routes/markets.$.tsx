import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarketsPage } from "@/components/site/MarketsPage";
import { findMarketPage } from "@/data/markets-nav";

export const Route = createFileRoute("/markets/$")({
  loader: ({ params }) => {
    const page = findMarketPage(params._splat ?? "");
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.label ?? "Crypto Markets"} — AadiCrypto`;
    const description = `Explore ${loaderData?.label ?? "crypto market"} data, rankings and intelligence with clearly labeled fictional demonstration data.`;
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
  component: MarketDetail,
});

function MarketDetail() {
  return <MarketsPage page={Route.useLoaderData()} />;
}