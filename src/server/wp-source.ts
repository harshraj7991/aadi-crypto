/**
 * Editorial content from WordPress: fetch, normalise, cache.
 *
 * The CMS is a back office on shared hosting. Readers never reach it — the
 * Worker fetches, caches at the edge, and serves. A slow or dead CMS costs a
 * slightly stale page, never an error, which is the same deal the market data
 * gets in `market-source.ts`.
 *
 * Server only. Never import this from a component.
 */

import type { Article, ArticlePage, ArticleSummary, ArticleTerm } from "@/types/article";
import { readCache, writeCache } from "./market-cache";

const WP = "https://cms.aadicrypto.com/wp-json/wp/v2";
const UPLOADS = "https://cms.aadicrypto.com/wp-content/uploads/";
const USER_AGENT = "AadiCrypto/1.0 (+https://aadicrypto.com)";
const UPSTREAM_TIMEOUT_MS = 10_000;

const LIST_TTL_MS = 60_000;
const ARTICLE_TTL_MS = 5 * 60 * 1000;
const TERMS_TTL_MS = 60 * 60 * 1000; // categories and tags barely move
const HARD_MULTIPLIER = 6; // how long a stale copy may still be served

export const ARTICLES_PER_PAGE = 20;

// ------------------------------------------------------------------- fetching

/**
 * Hostinger's CDN caches the REST API for seven days, which on a news site
 * means a story stays invisible for a week after publishing. A changing query
 * parameter defeats that. It costs nothing: the Worker's own cache still
 * decides how often WordPress is actually asked, so this is one request per
 * cache window, not one per reader.
 */
function bust(url: string, windowMs: number): string {
  const slot = Math.floor(Date.now() / windowMs);
  return `${url}${url.includes("?") ? "&" : "?"}_cb=${slot}`;
}

async function wpFetch<T>(
  path: string,
  windowMs: number,
): Promise<{ data: T; total: number; totalPages: number }> {
  const response = await fetch(bust(`${WP}${path}`, windowMs), {
    headers: { accept: "application/json", "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`WordPress ${path} responded ${response.status}`);
  return {
    data: (await response.json()) as T,
    total: Number(response.headers.get("x-wp-total") ?? 0),
    totalPages: Number(response.headers.get("x-wp-totalpages") ?? 0),
  };
}

/** Serve fresh, else serve stale and refresh alongside, else wait. */
async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<{ value: T; stale: boolean }> {
  const hit = await readCache<T>(key);
  if (hit) {
    const age = Date.now() - hit.fetchedAt;
    if (age < ttlMs) return { value: hit.value, stale: false };
    if (age < ttlMs * HARD_MULTIPLIER) {
      void refresh(key, ttlMs, load).catch(() => undefined);
      return { value: hit.value, stale: true };
    }
  }
  try {
    return { value: await refresh(key, ttlMs, load), stale: false };
  } catch (error) {
    if (hit) {
      console.error(`[wp] ${key} failed, serving last known copy:`, error);
      return { value: hit.value, stale: true };
    }
    throw error;
  }
}

async function refresh<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const value = await load();
  await writeCache(key, { value, fetchedAt: Date.now() }, (ttlMs / 1000) * HARD_MULTIPLIER * 2);
  return value;
}

// ------------------------------------------------------------------ taxonomy

type WpTerm = { id: number; name: string; slug: string; parent?: number };

async function terms(kind: "categories" | "tags"): Promise<Map<number, WpTerm>> {
  const { value } = await cached<WpTerm[]>(`wp:${kind}`, TERMS_TTL_MS, async () => {
    const all: WpTerm[] = [];
    for (let page = 1; page <= 3; page += 1) {
      const { data, totalPages } = await wpFetch<WpTerm[]>(
        `/${kind}?per_page=100&page=${page}&_fields=id,name,slug,parent`,
        TERMS_TTL_MS,
      );
      all.push(...data);
      if (page >= (totalPages || 1)) break;
    }
    return all;
  });
  return new Map(value.map((t) => [t.id, t]));
}

// ------------------------------------------------------------------- mapping

type WpPost = {
  id: number;
  slug: string;
  date_gmt: string;
  modified_gmt: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      slug: string;
      description?: string;
      avatar_urls?: Record<string, string>;
    }>;
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { width?: number; height?: number };
    }>;
  };
};

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();

const decodeTitle = (html: string): string =>
  html
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .trim();

/**
 * Images move onto our own domain so Cloudflare caches them. `cms` is DNS-only
 * by design, so a direct upload URL would send every reader straight to shared
 * hosting with no CDN in front.
 */
export function proxyImageUrl(sourceUrl: string): string | null {
  if (!sourceUrl.startsWith(UPLOADS)) return null;
  const path = sourceUrl.slice(UPLOADS.length);
  if (!path || path.includes("..")) return null;
  return `/img/${path}`;
}

function toSummary(
  post: WpPost,
  cats: Map<number, WpTerm>,
  tagMap: Map<number, WpTerm>,
): ArticleSummary | null {
  // Writers tick the child desk; its parent gives the pillar. A post filed only
  // against a pillar has no URL under this scheme, so it is held back rather
  // than published somewhere that 404s.
  const child = post.categories.map((id) => cats.get(id)).find((c) => c && c.parent);
  if (!child) return null;
  const parent = cats.get(child.parent ?? 0);
  if (!parent) return null;

  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const proxied = media?.source_url ? proxyImageUrl(media.source_url) : null;

  const wpAuthor = post._embedded?.author?.[0];
  const bio = (wpAuthor?.description ?? "").trim();

  const excerpt = stripTags(post.excerpt?.rendered ?? "");
  const words = stripTags(post.content?.rendered ?? post.excerpt?.rendered ?? "").split(
    /\s+/,
  ).length;

  const category: ArticleTerm = { name: decodeTitle(parent.name), slug: parent.slug };
  const subcategory: ArticleTerm = { name: decodeTitle(child.name), slug: child.slug };

  return {
    id: post.id,
    slug: post.slug,
    title: decodeTitle(post.title?.rendered ?? ""),
    excerpt,
    publishedAt: new Date(`${post.date_gmt}Z`).toISOString(),
    updatedAt: new Date(`${post.modified_gmt}Z`).toISOString(),
    author:
      wpAuthor && bio
        ? {
            id: wpAuthor.id,
            name: wpAuthor.name,
            slug: wpAuthor.slug,
            bio,
            avatar: wpAuthor.avatar_urls?.["96"] ?? null,
          }
        : null,
    category,
    subcategory,
    tags: post.tags
      .map((id) => tagMap.get(id))
      .filter((t): t is WpTerm => !!t)
      .map((t) => ({ name: decodeTitle(t.name), slug: t.slug })),
    image: proxied
      ? {
          url: proxied,
          alt: media?.alt_text || decodeTitle(post.title?.rendered ?? ""),
          width: media?.media_details?.width ?? 1200,
          height: media?.media_details?.height ?? 675,
        }
      : null,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    url: `/news/${parent.slug}/${child.slug}/${post.slug}`,
  };
}

// --------------------------------------------------------------------- public

const LIST_FIELDS =
  "id,slug,date_gmt,modified_gmt,title,excerpt,categories,tags,_links,author,featured_media";

/** One page of published stories, newest first. Optionally filtered by desk. */
export async function getArticles(
  opts: { page?: number; categorySlug?: string; subcategorySlug?: string } = {},
): Promise<ArticlePage> {
  const page = Math.max(1, opts.page ?? 1);
  const slug = opts.subcategorySlug ?? opts.categorySlug;
  const key = `wp:list:${slug ?? "all"}:${page}`;

  const { value, stale } = await cached<ArticlePage>(key, LIST_TTL_MS, async () => {
    const [cats, tagMap] = await Promise.all([terms("categories"), terms("tags")]);

    let filter = "";
    if (slug) {
      const term = [...cats.values()].find((c) => c.slug === slug);
      if (!term) return { articles: [], total: 0, totalPages: 0, page, stale: false };
      // A pillar includes its desks, which is what a reader expects.
      const ids = opts.subcategorySlug
        ? [term.id]
        : [term.id, ...[...cats.values()].filter((c) => c.parent === term.id).map((c) => c.id)];
      filter = `&categories=${ids.join(",")}`;
    }

    const { data, total, totalPages } = await wpFetch<WpPost[]>(
      `/posts?status=publish&per_page=${ARTICLES_PER_PAGE}&page=${page}` +
        `&_embed=author,wp:featuredmedia&_fields=${LIST_FIELDS},_embedded${filter}`,
      LIST_TTL_MS,
    );

    const articles = data
      .map((p) => toSummary(p, cats, tagMap))
      .filter((a): a is ArticleSummary => a !== null);

    return { articles, total, totalPages, page, stale: false };
  });

  return { ...value, stale };
}

/** A single story by slug, or null when there is no such published post. */
export async function getArticle(slug: string): Promise<Article | null> {
  const key = `wp:post:${slug}`;
  const { value } = await cached<Article | null>(key, ARTICLE_TTL_MS, async () => {
    const [cats, tagMap] = await Promise.all([terms("categories"), terms("tags")]);
    const { data } = await wpFetch<WpPost[]>(
      `/posts?slug=${encodeURIComponent(slug)}&status=publish&_embed=author,wp:featuredmedia`,
      ARTICLE_TTL_MS,
    );
    const post = data[0];
    if (!post) return null;
    const summary = toSummary(post, cats, tagMap);
    if (!summary) return null;
    return { ...summary, html: rewriteBodyImages(post.content?.rendered ?? "") };
  });
  return value;
}

/** Body images get the same proxy treatment as the featured image. */
function rewriteBodyImages(html: string): string {
  return html.replace(/(src|srcset)="([^"]+)"/g, (whole, attr: string, value: string) => {
    const rewritten = value
      .split(",")
      .map((part) => {
        const [url, ...rest] = part.trim().split(/\s+/);
        const proxied = url ? proxyImageUrl(url) : null;
        return proxied ? [proxied, ...rest].join(" ") : part.trim();
      })
      .join(", ");
    return `${attr}="${rewritten}"`;
  });
}

/** Serves /img/* — the reason readers never touch shared hosting for media. */
export async function fetchUpload(path: string): Promise<Response> {
  // Strictly inside the uploads directory. No traversal, no other host.
  if (!path || path.includes("..") || path.includes("//") || !/^[\w./@-]+$/.test(path)) {
    return new Response("Not found", { status: 404 });
  }
  const upstream = await fetch(`${UPLOADS}${path}`, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!upstream.ok) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", upstream.headers.get("content-type") ?? "application/octet-stream");
  // Uploads are immutable in practice: WordPress gives a new filename on change.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(upstream.body, { status: 200, headers });
}
