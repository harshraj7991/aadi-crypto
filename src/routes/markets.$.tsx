import { createFileRoute, notFound } from "@tanstack/react-router";
import { findMarketPage } from "@/data/markets-nav";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/markets/$")({
  // The markets tree is real navigation, so an unknown path still 404s.
  loader: ({ params }) => {
    const page = findMarketPage(params._splat ?? "");
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const label = loaderData?.label ?? "Crypto Markets";
    const title = `${label} — AadiCrypto`;
    const description = loaderData?.blurb ?? `${label} data, rankings and intelligence. In build.`;
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
  component: MarketDetail,
});

function MarketDetail() {
  const page = Route.useLoaderData();
  return (
    <ComingSoonPage
      title={page.label}
      blurb={
        page.blurb ??
        `${page.label} needs a data source we have not wired up yet. Live prices, market cap, dominance and sector movers for the top 100 coins are already running on the home page.`
      }
      items={[page.heading]}
    />
  );
}
