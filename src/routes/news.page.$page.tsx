import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { fetchArticles } from "@/lib/news-fn";
import { NewsList } from "@/components/site/NewsList";

export const Route = createFileRoute("/news/page/$page")({
  loader: async ({ params }) => {
    const page = Number(params.page);
    // Page one has a canonical home at /news, so send it there rather than
    // letting the same list live at two addresses. Permanent, because that is
    // what it is — the default 307 tells crawlers to keep trying this URL.
    if (page === 1) throw redirect({ to: "/news", statusCode: 301 });
    if (!Number.isInteger(page) || page < 2 || page > 1000) throw notFound();

    const feed = await fetchArticles({ data: { page } });
    // An empty page past the first is a dead end, not a page. A 404 keeps
    // crawlers out of an endless run of blank paginated URLs.
    if (feed.articles.length === 0) throw notFound();
    return { feed, page };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Page not found — AadiCrypto" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Crypto News — page ${loaderData.page} — AadiCrypto`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Markets, coins, DeFi, regulation and India-first crypto coverage.",
        },
        // Later pages are navigation, not destinations worth ranking.
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },

  component: NewsPaged,
});

function NewsPaged() {
  const { feed, page } = Route.useLoaderData();
  return <NewsList feed={feed} page={page} />;
}
