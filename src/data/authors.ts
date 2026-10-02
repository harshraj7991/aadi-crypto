/**
 * Bylines, keyed by WordPress user id.
 *
 * WordPress can serve this itself, but blocking the users endpoint is a sensible
 * hardening step — it is how attackers harvest login names — and that same block
 * hides author names and bios. Since crypto is a "Your Money or Your Life"
 * subject, a story with no named author gets held out of search, so losing
 * author data silently would quietly deindex the whole newsroom.
 *
 * So this file is the fallback: if the CMS will not tell us who wrote something,
 * we look it up here. Registering a writer is a deliberate one-off act rather
 * than something that happens automatically when an account is created, which
 * is the right shape for a site where AI assists the drafting.
 *
 * Leave it empty and nothing breaks — the CMS is tried first either way.
 */

export type RegisteredAuthor = {
  name: string;
  /** Shown on the article and used in NewsArticle structured data. */
  bio: string;
  /** URL segment for the author's page. Never the WordPress login. */
  slug: string;
};

export const authorsByWpId: Record<number, RegisteredAuthor> = {
  // 2: {
  //   name: "Harsh Raj",
  //   bio: "Harsh Raj covers crypto markets and policy in India.",
  //   slug: "harsh-raj",
  // },
};
