/**
 * The wire contract for editorial content.
 *
 * WordPress shapes are mapped into this in `src/server/wp-source.ts` and
 * nowhere else, so swapping the CMS later never reaches a component.
 */

export type ArticleAuthor = {
  id: number;
  name: string;
  slug: string;
  /** Plain text. Required to publish — see the note on `Article`. */
  bio: string;
  avatar: string | null;
};

export type ArticleTerm = { name: string; slug: string };

export type ArticleImage = {
  /** Already rewritten to our own /img proxy, never a cms.* URL. */
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO 8601, UTC. */
  publishedAt: string;
  updatedAt: string;
  /**
   * Null only when the CMS has no bio for the author. Crypto is a
   * "Your Money or Your Life" topic to search engines, which hold anonymous
   * financial content to a much lower standard — so a story without a real
   * named author is withheld rather than published badly.
   */
  author: ArticleAuthor | null;
  /** The pillar, e.g. Markets. */
  category: ArticleTerm;
  /** The desk under it, e.g. Price Action & Market Wraps. */
  subcategory: ArticleTerm;
  tags: ArticleTerm[];
  image: ArticleImage | null;
  readingMinutes: number;
  /** Canonical path on this site, e.g. /news/markets/trading-derivatives/slug */
  url: string;
};

export type Article = ArticleSummary & {
  /** Sanitised post body. */
  html: string;
};

export type ArticlePage = {
  articles: ArticleSummary[];
  total: number;
  totalPages: number;
  page: number;
  /** True when we are serving a cached copy after an upstream failure. */
  stale: boolean;
};
