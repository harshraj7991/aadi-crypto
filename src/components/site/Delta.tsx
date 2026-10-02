import { formatPercent } from "@/lib/format";

/** Directional percentage change. Gain/loss colours stay distinct from the brand green CTA. */
export function Delta({
  value,
  variant = "text",
  className = "",
}: {
  value: number | null;
  variant?: "text" | "badge";
  className?: string;
}) {
  if (value === null) {
    return <span className={`text-xs text-muted-foreground ${className}`}>—</span>;
  }
  const up = value >= 0;
  if (variant === "badge") {
    return (
      <span
        className={`tabular inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold ${
          up ? "bg-positive-tint text-positive" : "bg-negative-tint text-negative"
        } ${className}`}
      >
        <Caret up={up} />
        {formatPercent(value)}
      </span>
    );
  }
  return (
    <span
      className={`tabular inline-flex items-center gap-1 text-sm font-medium ${
        up ? "text-positive" : "text-negative"
      } ${className}`}
    >
      <Caret up={up} />
      {formatPercent(value)}
    </span>
  );
}

function Caret({ up }: { up: boolean }) {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" aria-hidden="true" className="shrink-0">
      <path d={up ? "M4 0l4 6H0z" : "M4 6L0 0h8z"} fill="currentColor" />
    </svg>
  );
}

export function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  // A provider can return an empty series; Math.min of nothing is Infinity and
  // the path comes out as NaN, which renders as a stray line across the cell.
  if (points.length < 2) return <span className="inline-block h-5 w-16" aria-hidden="true" />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 64},${20 - ((p - min) / span) * 18 - 1}`)
    .join(" ");
  return (
    <svg width="64" height="20" viewBox="0 0 64 20" aria-hidden="true" className="overflow-visible">
      <polyline
        points={d}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke={up ? "var(--color-positive)" : "var(--color-negative)"}
      />
    </svg>
  );
}
