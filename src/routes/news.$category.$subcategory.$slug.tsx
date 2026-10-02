import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/news/$category/$subcategory/$slug")({
  head: () => ({
    meta: [
      { title: "Story coming soon — AadiCrypto" },
      // No article exists at any of these URLs yet, so keep them out of search
      // regardless of the site-wide setting.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="Stories land here shortly"
      blurb="Article pages are wired and waiting on the newsroom pipeline. Until a story is genuinely reported, this URL stays empty rather than filled with placeholder copy."
    />
  ),
});
