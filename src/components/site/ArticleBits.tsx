import { Link } from "@tanstack/react-router";
import { formatLabels, type Article, type SortKey, sortOptions } from "@/data/articles";
import { findCategory } from "@/data/taxonomy";

export function deskLabel(article: Article) {
  const category = findCategory(article.category);
  const sub = category?.subcategories.find((s) => s.slug === article.subcategory);
  return sub?.title ?? category?.title ?? "News";
}


export function articleLinkProps(a: Article) {
  return {
    to: "/news/$category/$subcategory/$slug" as const,
    params: { category: a.year, subcategory: a.month, slug: a.slug },
  };
}

export function FormatBadge({ article }: { article: Article }) {
  if (article.format === "news") return null;
  return (
    <span className="kicker rounded-sm border border-primary/30 bg-accent px-1.5 py-0.5 text-accent-foreground">
      {formatLabels[article.format]}
    </span>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string; params?: Record<string, string> }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.to ? (
              <Link
                to={item.to}
                params={item.params as never}
                className="font-medium hover:text-primary-hover hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-ink">{item.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function HubHeader({
  kicker,
  title,
  blurb,
}: {
  kicker?: string;
  title: string;
  blurb?: string;
}) {
  return (
    <div className="border-b-2 border-ink pb-4">
      {kicker && <p className="kicker text-primary-hover">{kicker}</p>}
      <h1 className="mt-1.5 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight text-ink">
        {title}
      </h1>
      {blurb && (
        <p className="mt-2 max-w-[62ch] text-[15.5px] leading-relaxed text-muted-foreground">
          {blurb}
        </p>
      )}
    </div>
  );
}

export function SortTabs({
  active,
  onChange,
}: {
  active: SortKey;
  onChange: (key: SortKey) => void;
}) {
  return (
    <div className="scroll-x border-b border-border">
      <div role="tablist" aria-label="Sort stories" className="flex gap-1 whitespace-nowrap">
        {sortOptions.map((o) => (
          <button
            key={o.key}
            role="tab"
            type="button"
            aria-selected={active === o.key}
            onClick={() => onChange(o.key)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
              active === o.key
                ? "border-primary text-primary-hover"
                : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChipLinks({
  items,
}: {
  items: { label: string; to: string; params?: Record<string, string> }[];
}) {
  return (
    <div className="scroll-x">
      <ul className="flex gap-2 whitespace-nowrap">
        {items.map((c) => (
          <li key={c.label}>
            <Link
              to={c.to}
              params={c.params as never}
              className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary-hover"
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LeadCard({ article }: { article: Article }) {
  return (
    <article className="border-b border-border pb-7">
      <Link {...articleLinkProps(article)} className="group grid gap-5 md:grid-cols-2">
        {article.image && (
          <img
            src={article.image}
            alt=""
            width={1024}
            height={576}
            className="aspect-[16/9] w-full rounded-md border border-border object-cover"
          />
        )}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <span className="kicker text-primary-hover">{deskLabel(article)}</span>
            <span className="tabular">{article.time}</span>
            <FormatBadge article={article} />
          </div>
          <h2 className="text-[clamp(1.375rem,2.2vw,1.875rem)] font-extrabold leading-tight text-ink group-hover:text-primary-hover">
            {article.headline}
          </h2>
          <p className="text-[15.5px] leading-relaxed text-muted-foreground">{article.standfirst}</p>
          <p className="text-[12.5px] font-semibold text-ink">
            By {article.author} · {article.readingTime} min read
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <li className="border-b border-border last:border-0">
      <Link {...articleLinkProps(article)} className="group flex gap-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
            <span className="tabular">{article.time}</span>
            <FormatBadge article={article} />
            {article.region && <span>{article.region}</span>}
          </div>
          <h3 className="mt-1.5 text-[16.5px] font-bold leading-snug text-ink group-hover:text-primary-hover">
            {article.headline}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
            {article.standfirst}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-ink">By {article.author}</p>
        </div>
        {article.image && (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            width={320}
            height={180}
            className="hidden aspect-[16/9] w-[132px] shrink-0 rounded-sm border border-border object-cover sm:block md:w-[172px]"
          />
        )}
      </Link>
    </li>
  );
}

export function ArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="py-10 text-[15px] text-muted-foreground">
        No stories filed here yet. Check back shortly.
      </p>
    );
  }
  return (
    <ul>
      {articles.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
    </ul>
  );
}

export function CompactList({ title, articles }: { title: string; articles: Article[] }) {
  return (
    <section>
      <h2 className="border-b-2 border-ink pb-2 text-[15px] font-extrabold uppercase tracking-wide text-ink">
        {title}
      </h2>
      <ul>
        {articles.map((a) => (
          <li key={a.id} className="border-b border-border last:border-0">
            <Link {...articleLinkProps(a)} className="group block py-3">
              <p className="tabular text-[11.5px] text-muted-foreground">{a.time}</p>
              <p className="mt-1 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary-hover">
                {a.headline}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
