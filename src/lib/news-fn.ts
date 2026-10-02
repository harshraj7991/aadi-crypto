/**
 * Server-side entries for route loaders.
 *
 * Lives outside `src/server/` on purpose: the import-protection plugin blocks
 * client imports from there, and the Start plugin needs to swap these for a
 * remote call in the browser bundle. The handler bodies and their dynamic
 * imports are stripped from the client build, so the CMS host never ships.
 */

import { createServerFn } from "@tanstack/react-start";
import type { Article, ArticlePage } from "@/types/article";

export const fetchArticles = createServerFn({ method: "GET" })
  .validator((input: { page?: number; categorySlug?: string; subcategorySlug?: string }) => input)
  .handler(async ({ data }): Promise<ArticlePage> => {
    const { getArticles } = await import("@/server/wp-source");
    return getArticles(data);
  });

export const fetchArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }): Promise<Article | null> => {
    const { getArticle } = await import("@/server/wp-source");
    return getArticle(data);
  });
