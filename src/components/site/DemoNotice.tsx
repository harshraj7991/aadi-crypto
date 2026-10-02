import { Info } from "lucide-react";

export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Demo content notice"
      className={`border-y border-primary/30 bg-accent text-accent-foreground ${compact ? "px-3 py-2" : "px-4 py-3"}`}
    >
      <div className="flex items-start gap-2.5">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary-hover" />
        <p className="text-[13px] leading-relaxed">
          <strong>Fictional demo content.</strong> Stories, prices, dates, people and quotes on this
          page are illustrative placeholders—not current reporting or financial advice.
        </p>
      </div>
    </aside>
  );
}