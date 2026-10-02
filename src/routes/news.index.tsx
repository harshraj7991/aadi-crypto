import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { articles, sortArticles, type SortKey } from "@/data/articles";
import { categories, topics } from "@/data/taxonomy";
import {
  ArticleList,
  ChipLinks,
  CompactList,
  HubHeader,
  LeadCard,
  SortTabs,
} from "@/components/site/ArticleBits";

const title = "Latest Crypto News — AadiCrypto";
const description =
  "Every crypto story as it files: markets, coins, DeFi, stablecoins, regulation, business, institutions and technology, sortable by latest, trending, most read and market impact.";

export const Route = createFileRoute("/news/")({
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
  component: NewsIndex,
});

function NewsIndex() {
  const [sort, setSort] = useState<SortKey>("latest");
  const sorted = sortArticles(articles, sort);
  const [lead, ...rest] = sorted;
  const mostRead = sortArticles(articles, "most-read").slice(0, 6);

  return (
    <div className="container-page py-8">
      <HubHeader
        kicker="Newsroom"
        title="Latest crypto news"
        blurb="One canonical story, filed under one desk and cross-listed across the coins, topics and regions it touches."
      />

      <div className="mt-4">
        <ChipLinks
          items={[
            ...topics.map((t) => ({
              label: t.title,
              to: "/topics/$slug",
              params: { slug: t.slug },
            })),
          ]}
        />
      </div>

      <div className="mt-6 grid gap-9 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SortTabs active={sort} onChange={setSort} />
          <div className="mt-6">{lead && <LeadCard article={lead} />}</div>
          <ArticleList articles={rest} />
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <CompactList title="Most Read" articles={mostRead} />
          <section>
            <h2 className="border-b-2 border-ink pb-2 text-[15px] font-extrabold uppercase tracking-wide text-ink">
              Desks
            </h2>
            <ul className="mt-1">
              {categories.map((c) => (
                <li key={c.slug} className="border-b border-border last:border-0">
                  <Link
                    to="/news/$category"
                    params={{ category: c.slug }}
                    className="block py-2.5 text-[14.5px] font-semibold text-ink hover:text-primary-hover"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
