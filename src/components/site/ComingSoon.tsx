import { Link } from "@tanstack/react-router";

/**
 * Placeholder for a section that has no real data behind it yet.
 *
 * Deliberately says what is missing and what is already working, rather than a
 * bare "coming soon" — a reader who lands here should know the market data on
 * the home page is live and worth their time.
 */
export function ComingSoon({
  title,
  blurb,
  items,
  compact = false,
  showLink = true,
}: {
  title: string;
  blurb: string;
  items?: readonly string[];
  compact?: boolean;
  /** Off for the panels on the home page, where the live data is right above. */
  showLink?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border border-dashed border-border bg-surface-cool text-center ${
        compact ? "px-6 py-10" : "px-6 py-14 md:px-10 md:py-20"
      }`}
    >
      <p className="kicker text-primary-hover">Coming soon</p>
      <h2
        className={`mx-auto mt-3 max-w-[20ch] font-extrabold leading-[1.15] text-ink ${
          compact ? "text-[20px]" : "text-[24px] md:text-[30px]"
        }`}
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-muted-foreground">
        {blurb}
      </p>

      {items && items.length > 0 && (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {showLink && (
        <p className="mt-7 text-[13.5px]">
          <Link to="/" className="font-semibold text-primary-hover hover:underline">
            Live market data is on the home page →
          </Link>
        </p>
      )}
    </div>
  );
}

/** Full-page version for routes that have nothing real behind them yet. */
export function ComingSoonPage(props: { title: string; blurb: string; items?: readonly string[] }) {
  return (
    <div className="container-page py-10 md:py-16">
      <ComingSoon {...props} />
    </div>
  );
}
