import { createFileRoute } from "@tanstack/react-router";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { MarketTable } from "@/components/site/MarketTable";
import { ComingSoon } from "@/components/site/ComingSoon";

const title = "AadiCrypto — Crypto Prices, Markets & News";
const description =
  "Live crypto prices, market capitalisation, dominance and sector movers across the top 100 coins. News and research coverage is on the way.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

/**
 * Only the market blocks are on real data, so only the market blocks are here.
 * The news, research and account sections stay out until there is something
 * true behind them — a placeholder is honest, a fabricated headline is not.
 */
function Index() {
  return (
    <>
      <h1 className="sr-only">AadiCrypto — crypto prices, markets and news</h1>

      <MarketSnapshot />
      <MarketTable />

      <section aria-label="Newsroom" className="container-page pb-6">
        <ComingSoon
          showLink={false}
          title="The newsroom opens next"
          blurb="Markets, coins and ecosystems, DeFi and stablecoins, regulation, institutions and India-first coverage — filed to one desk and cross-listed across the coins and topics each story touches."
          items={[
            "Markets & price action",
            "Coins & ecosystems",
            "DeFi & stablecoins",
            "Regulation & policy",
            "India",
            "ETFs & institutions",
          ]}
        />
      </section>

      <section aria-label="Research, learning and accounts" className="container-page pb-14">
        <ComingSoon
          compact
          showLink={false}
          title="Research, guides and watchlists"
          blurb="On-chain intelligence, token unlock calendars, explainers and a free account to follow the coins you care about."
          items={["Research", "Learn", "Watchlists", "Newsletter", "On-chain intelligence"]}
        />
      </section>
    </>
  );
}
