import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { byAsset, sortArticles, type SortKey } from "@/data/articles";
import { coinHubs, findCoin } from "@/data/taxonomy";
import {
  ArticleList,
  Breadcrumbs,
  ChipLinks,
  HubHeader,
  SortTabs,
} from "@/components/site/ArticleBits";

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
    const { coin } = loaderData;
    const title = `${coin.name} (${coin.symbol}) News & Price Coverage | AadiCrypto`;
    const description = `The latest ${coin.name} news, analysis and market coverage from AadiCrypto.`;
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
  component: CoinHub,
});

function CoinHub() {
  const { coin } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("latest");
  const list = sortArticles(byAsset(coin.symbol), sort);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Coins" }, { label: coin.name }]} />
      <div className="mt-4">
        <HubHeader
          kicker={coin.symbol}
          title={`${coin.name} news`}
          blurb={`Every ${coin.name} story on AadiCrypto: markets, ecosystem, regulation and research.`}
        />
      </div>
      <div className="mt-4">
        <ChipLinks
          items={coinHubs
            .filter((c) => c.slug !== coin.slug)
            .map((c) => ({ label: c.name, to: "/coins/$slug", params: { slug: c.slug } }))}
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
