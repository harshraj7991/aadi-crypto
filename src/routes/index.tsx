import { createFileRoute } from "@tanstack/react-router";
import { NewsGrid } from "@/components/site/NewsGrid";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { MarketTable } from "@/components/site/MarketTable";
import {
  CategoryNewsroom,
  IndiaSection,
  IntelligenceDashboard,
  LearnSection,
  Newsletter,
  PersonalizedModule,
  ResearchSection,
  WhyMoving,
} from "@/components/site/Sections";

const title = "AadiCrypto — Crypto News, Markets & Intelligence";
const description =
  "Breaking crypto news, live market data, DeFi and ETF intelligence, research and India-first coverage — everything happening in crypto, understood in one place.";

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

function Index() {
  return (
    <>
      <h1 className="sr-only">AadiCrypto — crypto news, markets and intelligence</h1>
      <NewsGrid />
      <MarketSnapshot />
      <MarketTable />
      <PersonalizedModule />
      <CategoryNewsroom />
      <IntelligenceDashboard />
      <WhyMoving />
      <IndiaSection />
      <ResearchSection />
      <LearnSection />
      <Newsletter />
    </>
  );
}
