import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/site/ComingSoon";

const title = "Crypto News — AadiCrypto";
const description =
  "Markets, coins, DeFi, stablecoins, regulation, institutions and India-first crypto coverage. The newsroom is in build.";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="The newsroom opens next"
      blurb="One canonical story per event, filed to a single desk and cross-listed across the coins, topics and regions it touches. Nothing is published here until it is real reporting."
      items={[
        "Markets & price action",
        "Coins & ecosystems",
        "DeFi & stablecoins",
        "Regulation & policy",
        "Institutions & ETFs",
        "India",
      ]}
    />
  ),
});
