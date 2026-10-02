import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { articles } from "@/data/articles";
import { categories, coinHubs, contentFormats, findTopic } from "@/data/taxonomy";

export type SiteLinkTarget = { to: string; params?: Record<string, string> };

const NEWS: SiteLinkTarget = { to: "/news" };

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Labels whose destination isn't derivable from the slug alone. */
const overrides: Record<string, SiteLinkTarget> = {
  home: { to: "/" },
  latest: NEWS,
  news: NEWS,
  "all-news": NEWS,
  markets: { to: "/news/$category", params: { category: "markets" } },
  prices: { to: "/news/$category", params: { category: "markets" } },
  movers: {
    to: "/news/$category/$subcategory",
    params: { category: "markets", subcategory: "price-action-market-wraps" },
  },
  heatmap: { to: "/news/$category", params: { category: "markets" } },
  "market-heatmap": { to: "/news/$category", params: { category: "markets" } },
  "view-all-markets": { to: "/news/$category", params: { category: "markets" } },
  categories: NEWS,
  exchanges: {
    to: "/news/$category/$subcategory",
    params: { category: "business-institutions", subcategory: "exchanges-brokers" },
  },
  derivatives: {
    to: "/news/$category/$subcategory",
    params: { category: "markets", subcategory: "trading-derivatives" },
  },
  "on-chain": {
    to: "/news/$category",
    params: { category: "on-chain-data" },
  },
  defi: { to: "/news/$category", params: { category: "defi-stablecoins" } },
  regulation: { to: "/news/$category", params: { category: "regulation-policy" } },
  policy: { to: "/news/$category", params: { category: "regulation-policy" } },
  "taxes-compliance": {
    to: "/news/$category/$subcategory",
    params: { category: "regulation-policy", subcategory: "global-policy-tax-cbdcs" },
  },
  tech: { to: "/news/$category", params: { category: "technology-web3-infrastructure" } },
  business: { to: "/news/$category", params: { category: "business-institutions" } },
  security: {
    to: "/news/$category",
    params: { category: "security-risk" },
  },
  web3: { to: "/news/$category", params: { category: "web3-culture-consumer" } },
  cbdc: {
    to: "/news/$category/$subcategory",
    params: { category: "regulation-policy", subcategory: "global-policy-tax-cbdcs" },
  },
  treasuries: {
    to: "/news/$category/$subcategory",
    params: { category: "markets", subcategory: "etfs-funds-treasuries" },
  },
  "token-unlocks": {
    to: "/news/$category/$subcategory",
    params: { category: "coins-ecosystems", subcategory: "altcoins-memecoins-emerging-tokens" },
  },
  altcoins: { to: "/news/$category", params: { category: "coins-ecosystems" } },
  startups: {
    to: "/news/$category/$subcategory",
    params: { category: "business-institutions", subcategory: "funding-vc-ma" },
  },
  etfs: { to: "/topics/$slug", params: { slug: "etfs" } },
  institutional: { to: "/news/$category", params: { category: "business-institutions" } },
  research: { to: "/formats/$slug", params: { slug: "research" } },
  "all-research": { to: "/formats/$slug", params: { slug: "research" } },
  analysis: { to: "/formats/$slug", params: { slug: "analysis" } },
  opinion: { to: "/formats/$slug", params: { slug: "opinion" } },
  explainers: { to: "/formats/$slug", params: { slug: "explainers" } },
  "market-outlook": { to: "/formats/$slug", params: { slug: "analysis" } },
  "weekly-report": { to: "/formats/$slug", params: { slug: "research" } },
};

/** Best-effort destination for a nav / chip / footer label. */
export function labelLink(label: string): SiteLinkTarget {
  const slug = slugify(label);
  const direct = overrides[slug];
  if (direct) return direct;

  if (findTopic(slug)) return { to: "/topics/$slug", params: { slug } };
  if (coinHubs.some((c) => c.slug === slug)) return { to: "/coins/$slug", params: { slug } };
  if (contentFormats.some((f) => f.slug === slug)) return { to: "/formats/$slug", params: { slug } };

  const category = categories.find((c) => c.slug === slug);
  if (category) return { to: "/news/$category", params: { category: category.slug } };

  for (const c of categories) {
    const sub = c.subcategories.find((s) => s.slug === slug);
    if (sub) {
      return {
        to: "/news/$category/$subcategory",
        params: { category: c.slug, subcategory: sub.slug },
      };
    }
  }
  return NEWS;
}

/** Link to the full story behind a homepage headline, if one exists. */
export function storyLink(headline: string): SiteLinkTarget {
  const target = headline.trim().toLowerCase();
  const match =
    articles.find((a) => a.headline.trim().toLowerCase() === target) ??
    articles.find((a) => a.headline.toLowerCase().startsWith(target.slice(0, 40)));
  if (!match) return NEWS;
  return {
    to: "/news/$category/$subcategory/$slug",
    params: { category: match.year, subcategory: match.month, slug: match.slug },
  };
}

export function SiteLink({
  target,
  className,
  children,
  ariaLabel,
}: {
  target: SiteLinkTarget;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const extra = target.params ? { params: target.params as never } : {};
  return (
    <Link to={target.to as never} {...extra} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
