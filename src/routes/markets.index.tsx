import { createFileRoute } from "@tanstack/react-router";
import { MarketsPage } from "@/components/site/MarketsPage";

const title = "Crypto Markets Overview — AadiCrypto";
const description = "Explore fictional demonstration prices, market breadth, movers, sectors, derivatives and crypto market intelligence.";

export const Route = createFileRoute("/markets/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketsPage,
});