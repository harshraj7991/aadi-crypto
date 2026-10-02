import { Link } from "@tanstack/react-router";
import { SiteLink, storyLink } from "./links";
import { latestFeed, leadStory, secondaryStories, type Story } from "@/data/news";

function Badge({ label }: { label: string }) {
  return (
    <span className="kicker rounded-sm border border-primary/30 bg-accent px-1.5 py-0.5 text-accent-foreground">
      {label}
    </span>
  );
}

function Meta({ story }: { story: Story }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
      <span className="kicker text-primary-hover">{story.category}</span>
      <span aria-hidden="true">·</span>
      <span>{story.time}</span>
      {story.badge && <Badge label={story.badge} />}
    </div>
  );
}

export function NewsGrid() {
  return (
    <section aria-label="Top stories" className="container-page py-7">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Lead story */}
        <article className="lg:col-span-6">
          <SiteLink target={storyLink(leadStory.headline)} className="group block">
            <img
              src={leadStory.image}
              alt=""
              width={1280}
              height={720}
              className="aspect-[16/9] w-full rounded-md border border-border object-cover"
            />
            <div className="mt-4 space-y-3">
              <Meta story={leadStory} />
              <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] font-extrabold leading-[1.12] text-ink group-hover:text-primary-hover">
                {leadStory.headline}
              </h2>
              <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-muted-foreground">
                {leadStory.summary}
              </p>
              <p className="text-[12.5px] font-semibold text-ink">By {leadStory.author}</p>
            </div>
          </SiteLink>
        </article>

        {/* Secondary stories */}
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
          {secondaryStories.map((s) => (
            <article key={s.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <SiteLink target={storyLink(s.headline)} className="group block">
                <img
                  src={s.image}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={576}
                  className="aspect-[16/9] w-full rounded-sm border border-border object-cover"
                />
                <div className="mt-3 space-y-2">
                  <Meta story={s} />
                  <h3 className="text-[18px] font-bold leading-snug text-ink group-hover:text-primary-hover">
                    {s.headline}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">{s.summary}</p>
                </div>
              </SiteLink>
            </article>
          ))}
        </div>

        {/* Latest feed */}
        <aside className="lg:col-span-3">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
            <h2 className="text-[15px] font-extrabold uppercase tracking-wide text-ink">
              Latest News
            </h2>
            <Link to="/news" className="text-[12px] font-semibold text-primary-hover hover:underline">
              All news
            </Link>
          </div>
          <ul>
            {latestFeed.map((s) => (
              <li key={s.id} className="border-b border-border">
                <SiteLink target={storyLink(s.headline)} className="group block py-3">
                  <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                    <span className="kicker text-primary-hover">{s.category}</span>
                    <span className="tabular">{s.time}</span>
                  </div>
                  <p className="mt-1 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary-hover">
                    {s.headline}
                  </p>
                </SiteLink>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
