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
  /**
   * A smaller copy for link previews (og:image). WhatsApp drops preview images
   * over roughly 300 KB, and the full-size uploads are PNGs well past that.
   */
  share: { url: string; width: number; height: number };
};

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  /** The italic standfirst editors write as the first line of the body. */
  subtitle: string;
  excerpt: string;
  /** The "Quick News Summary" bullets, lifted out of the body. */
  summary: string[];
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
  /**
   * Best available desk for display. Editors tick several categories per post
   * and invent new ones, so this is a label, never the URL — see `url`.
   */
  category: ArticleTerm | null;
  subcategory: ArticleTerm | null;
  tags: ArticleTerm[];
  image: ArticleImage | null;
  readingMinutes: number;
  /**
   * Canonical path, built from the publish date: /news/2026/10/the-slug
   *
   * Deliberately not built from categories. Editors tick several per post, so a
   * category-derived URL changes when they reorder them, and a post with no
   * child desk would have no URL at all. A publish date never changes.
   */
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
