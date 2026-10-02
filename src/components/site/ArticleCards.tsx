import { Link } from "@tanstack/react-router";

import type { ArticleSummary } from "@/types/article";

/** "4 hours ago" up to a week, then a plain date. */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Kicker({ article }: { article: ArticleSummary }) {
  return (
    <p className="kicker flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
      <span className="text-primary-hover">{article.subcategory.name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
    </p>
  );
}

/** The one big story at the top of a list. */
export function LeadStory({ article }: { article: ArticleSummary }) {
  return (
    <article className="group grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-start">
      {article.image && (
        <Link to={article.url} className="block overflow-hidden rounded-sm bg-surface-cool">
          <img
            src={article.image.url}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="eager"
          />
        </Link>
      )}
      <div>
        <Kicker article={article} />
        <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-[1.14] text-ink">
          <Link to={article.url} className="hover:text-primary-hover">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="mt-3 max-w-[46ch] text-[16.5px] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <Byline article={article} className="mt-4" />
      </div>
    </article>
  );
}

export function StoryCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group grid gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[1fr_180px]">
      <div>
        <Kicker article={article} />
        <h3 className="mt-1.5 text-[18px] font-bold leading-snug text-ink">
          <Link to={article.url} className="hover:text-primary-hover">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <Byline article={article} className="mt-2.5" />
      </div>
      {article.image && (
        <Link
          to={article.url}
          className="order-first block overflow-hidden rounded-sm bg-surface-cool sm:order-last"
        >
          <img
            src={article.image.url}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </Link>
      )}
    </article>
  );
}

/** Compact headline-only row for sidebars. */
export function HeadlineRow({ article }: { article: ArticleSummary }) {
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <p className="kicker text-muted-foreground">
        <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
      </p>
      <h3 className="mt-1 text-[15px] font-semibold leading-snug text-ink">
        <Link to={article.url} className="hover:text-primary-hover">
          {article.title}
        </Link>
      </h3>
    </li>
  );
}

export function Byline({
  article,
  className = "",
}: {
  article: ArticleSummary;
  className?: string;
}) {
  if (!article.author) return null;
  return (
    <p className={`flex items-center gap-2 text-[13px] text-muted-foreground ${className}`}>
      {article.author.avatar && (
        <img
          src={article.author.avatar}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 rounded-full"
          loading="lazy"
        />
      )}
      <span>
        By <span className="font-semibold text-ink">{article.author.name}</span>
      </span>
      <span aria-hidden="true">·</span>
      <span>{article.readingMinutes} min read</span>
    </p>
  );
}
