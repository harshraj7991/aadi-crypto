import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/site/ComingSoon";

const title = "Crypto Markets — AadiCrypto";
const description =
  "Market breadth, movers, sectors, derivatives and on-chain intelligence. Live prices for the top 100 coins are already running on the home page.";

export const Route = createFileRoute("/markets/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="The full markets section"
      blurb="Prices, market cap, dominance and sector movers for the top 100 coins are live on the home page today. These deeper views — derivatives, open interest, funding, liquidations and on-chain breadth — need data sources we have not wired yet."
      items={[
        "Movers & breadth",
        "Sector markets",
        "Derivatives & open interest",
        "Funding & liquidations",
        "Technical signals",
        "On-chain",
      ]}
    />
  ),
});
