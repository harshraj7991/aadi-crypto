import { intelligence, whyMoving } from "@/data/market";
import { indiaStories, learnTracks, newsroom, research, type Story } from "@/data/news";
import { Delta } from "./Delta";
import { labelLink, SiteLink, storyLink, type SiteLinkTarget } from "./links";

function SectionHead({
  title,
  target,
  cta = "See all",
}: {
  title: string;
  target?: SiteLinkTarget;
  cta?: string;
}) {
  return (
    <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
      <h2 className="text-[22px] font-extrabold text-ink">{title}</h2>
      <SiteLink
        target={target ?? labelLink(title)}
        className="text-[13px] font-semibold text-primary-hover hover:underline"
      >
        {cta} →
      </SiteLink>
    </div>
  );
}

/* ---------- Personalised module (logged-out state) ---------- */

export function PersonalizedModule() {
  return (
    <section className="border-y border-border bg-ink text-background">
      <div className="container-page flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[60ch]">
          <h2 className="text-[26px] font-extrabold leading-tight">Make AadiCrypto yours</h2>
          <p className="mt-2 text-[15.5px] leading-relaxed text-background/70">
            Create a watchlist and get news, alerts and market moves for the cryptocurrencies you
            follow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-sm bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Create free account
          </button>
          <button
            type="button"
            className="rounded-sm border border-background/30 px-4 py-2.5 text-[13.5px] font-semibold text-background transition-colors hover:bg-background/10"
          >
            Explore watchlists
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Category newsroom ---------- */

function RowStory({ story }: { story: Story }) {
  return (
    <li className="border-b border-border last:border-0">
      <SiteLink target={storyLink(story.headline)} className="group flex gap-3 py-3">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        <div>
          <p className="text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary-hover">
            {story.headline}
          </p>
          <p className="tabular mt-1 text-[11.5px] text-muted-foreground">{story.time}</p>
        </div>
      </SiteLink>
    </li>
  );
}

export function CategoryNewsroom() {
  return (
    <section aria-label="Newsroom" className="container-page space-y-10 py-9">
      {newsroom.map((section, i) => (
        <div key={section.id}>
          <SectionHead title={section.title} cta={`All ${section.title}`} />
          <div
            className={`mt-5 grid gap-7 lg:grid-cols-12 ${
              i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <article className="lg:col-span-7">
              <SiteLink
                target={storyLink(section.featured.headline)}
                className="group grid gap-4 sm:grid-cols-2"
              >
                <img
                  src={section.featured.image}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={576}
                  className="aspect-[16/10] w-full rounded-sm border border-border object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                    <span className="kicker text-primary-hover">{section.featured.category}</span>
                    <span className="tabular">{section.featured.time}</span>
                  </div>
                  <h3 className="mt-2 text-[19px] font-bold leading-snug text-ink group-hover:text-primary-hover">
                    {section.featured.headline}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    {section.featured.summary}
                  </p>
                  <p className="mt-2 text-[12px] font-semibold text-ink">
                    By {section.featured.author}
                  </p>
                </div>
              </SiteLink>
            </article>
            <ul className="lg:col-span-5">
              {section.stories.map((s) => (
                <RowStory key={s.id} story={s} />
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- Intelligence dashboard ---------- */

export function IntelligenceDashboard() {
  return (
    <section aria-label="Crypto intelligence" className="border-y border-border bg-surface">
      <div className="container-page py-9">
        <SectionHead title="Crypto Intelligence" target={labelLink("Markets")} cta="Open dashboards" />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {intelligence.map((m) => (
            <div
              key={m.label}
              className="card-lift rounded-sm border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="kicker text-muted-foreground">{m.label}</p>
                <Delta value={m.change} variant="badge" />
              </div>
              <p className="tabular mt-2.5 text-[24px] font-bold leading-none text-ink">{m.value}</p>
              <p className="mt-2 text-[12.5px] text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Why is it moving ---------- */

export function WhyMoving() {
  return (
    <section aria-label="Why the market is moving" className="container-page py-9">
      <div className="rounded-md border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="text-[21px] font-extrabold text-ink">
            Why is {whyMoving.symbol} moving today?
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{whyMoving.symbol}</span>
            <Delta value={whyMoving.change} variant="badge" />
          </div>
        </div>
        <ol className="divide-y divide-border">
          {whyMoving.reasons.map((r, i) => (
            <li key={r.tag} className="flex gap-4 p-5">
              <span className="tabular mt-0.5 text-[13px] font-bold text-primary">
                0{i + 1}
              </span>
              <div>
                <p className="kicker text-muted-foreground">{r.tag}</p>
                <p className="mt-1.5 text-[15.5px] leading-relaxed text-ink">{r.text}</p>
                <SiteLink
                  target={labelLink(r.tag)}
                  className="mt-1.5 inline-flex text-[12.5px] font-semibold text-primary-hover hover:underline"
                >
                  Source: {r.source} →
                </SiteLink>
              </div>
            </li>
          ))}
        </ol>
        <p className="border-t border-border bg-surface-cool px-5 py-3 text-[12px] text-muted-foreground">
          Every factor links to reported coverage. AadiCrypto never publishes an unsourced causal
          explanation for a price move.
        </p>
      </div>
    </section>
  );
}

/* ---------- India Crypto ---------- */

const indiaTopics = [
  "Regulation",
  "Policy",
  "Exchanges",
  "Taxes & Compliance",
  "Startups",
  "Web3",
  "CBDC",
];

export function IndiaSection() {
  const featured = indiaStories[0]!;
  const rest = indiaStories.slice(1);
  return (
    <section aria-label="India crypto" className="border-y border-border bg-surface-cool">
      <div className="container-page py-9">
        <SectionHead title="India Crypto" target={labelLink("India")} cta="All India coverage" />
        <div className="scroll-x mt-4">
          <ul className="flex gap-2 whitespace-nowrap">
            {indiaTopics.map((t) => (
              <li key={t}>
                <SiteLink
                  target={labelLink(t)}
                  className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary-hover"
                >
                  {t}
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 grid gap-7 lg:grid-cols-12">
          <article className="lg:col-span-6">
            <SiteLink target={storyLink(featured.headline)} className="group block">
              <img
                src={featured.image}
                alt=""
                loading="lazy"
                width={1024}
                height={576}
                className="aspect-[16/9] w-full rounded-sm border border-border object-cover"
              />
              <div className="mt-3">
                <span className="kicker text-primary-hover">{featured.category}</span>
                <h3 className="mt-1.5 text-[21px] font-bold leading-snug text-ink group-hover:text-primary-hover">
                  {featured.headline}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
                  {featured.summary}
                </p>
              </div>
            </SiteLink>
          </article>
          <ul className="lg:col-span-6">
            {rest.map((s) => (
              <RowStory key={s.id} story={s} />
            ))}
          </ul>
        </div>
        <p className="mt-5 text-[12px] text-muted-foreground">
          Tax and regulatory coverage is general information, not individual professional advice.
        </p>
      </div>
    </section>
  );
}

/* ---------- Research ---------- */

export function ResearchSection() {
  return (
    <section aria-label="Research" className="container-page py-9">
      <SectionHead title="AadiCrypto Research" target={labelLink("Research")} cta="All research" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {research.map((r) => (
          <article
            key={r.id}
            className="card-lift flex flex-col rounded-md border border-border bg-ink p-5 text-background"
          >
            <span className="kicker text-[oklch(0.82_0.14_132)]">{r.category}</span>
            <h3 className="mt-2.5 text-[18px] font-bold leading-snug">
              <SiteLink target={storyLink(r.headline)} className="hover:underline">
                {r.headline}
              </SiteLink>
            </h3>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-background/70">
              {r.summary}
            </p>
            <p className="tabular mt-4 text-[11.5px] text-background/60">
              {r.author} · {r.time}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Learn ---------- */

export function LearnSection() {
  return (
    <section aria-label="Learn crypto" className="border-y border-border bg-surface">
      <div className="container-page py-9">
        <SectionHead title="Learn Crypto" target={labelLink("Explainers")} cta="Browse tracks" />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {learnTracks.map((t) => (
            <SiteLink
              key={t.title}
              target={labelLink(t.title)}
              className="card-lift rounded-sm border border-border bg-card p-4 shadow-card"
            >
              <p className="text-[15px] font-bold leading-snug text-ink">{t.title}</p>
              <p className="mt-2 text-[12px] text-muted-foreground">{t.level}</p>
              <p className="tabular mt-0.5 text-[12px] text-primary-hover">{t.lessons} lessons</p>
            </SiteLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Newsletter ---------- */

export function Newsletter() {
  return (
    <section aria-label="Newsletter" className="container-page py-11">
      <div className="grid gap-6 rounded-md border border-border bg-card p-6 shadow-card md:grid-cols-2 md:items-center md:p-8">
        <div>
          <h2 className="text-[26px] font-extrabold leading-tight text-ink">
            The AadiCrypto Daily
          </h2>
          <p className="mt-2 max-w-[46ch] text-[15.5px] leading-relaxed text-muted-foreground">
            The five things you need to know before the crypto market gets noisy.
          </p>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-sm border border-input bg-background px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="rounded-sm bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Get the Daily Brief
          </button>
        </form>
      </div>
    </section>
  );
}
