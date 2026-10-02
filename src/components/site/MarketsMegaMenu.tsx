import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { marketsMenu } from "@/data/markets-nav";

/** Desktop Markets mega-menu: four compact columns of market utilities. */
export function MarketsMegaMenu() {
  return (
    <li className="group static">
      <Link
        to="/markets"
        className="inline-flex items-center gap-1 border-b-2 border-transparent py-1 text-ink transition-colors group-hover:border-primary group-hover:text-primary-hover [&.active]:border-primary [&.active]:text-primary-hover"
        activeProps={{ className: "active" }}
      >
        Markets
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      </Link>
      <div className="invisible absolute left-0 right-0 top-full z-50 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <div className="mx-auto w-full max-w-[1400px] px-4">
          <div className="grid grid-cols-4 divide-x divide-border rounded-b-md border border-t-0 border-border bg-popover shadow-lift">
            {marketsMenu.map((column, i) => (
              <div key={i} className="min-w-0 px-5 py-4">
                {column.sections.map((section) => (
                  <div key={section.heading} className="mb-4 last:mb-0">
                    <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink">
                      {section.heading}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path as never}
                            className="flex items-center gap-1.5 py-[3px] text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary-hover"
                          >
                            {item.label}
                            {item.badge && (
                              <span className="rounded-sm bg-primary px-1 py-px text-[9.5px] font-bold uppercase text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Flat list used by the mobile drawer. */
export function MarketsMobileList() {
  return (
    <div className="space-y-3">
      {marketsMenu.flatMap((c) => c.sections).map((section) => (
        <details key={section.heading} className="rounded-sm border border-border">
          <summary className="cursor-pointer px-3 py-2 text-[13px] font-semibold text-ink">
            {section.heading}
          </summary>
          <ul className="px-3 pb-2">
            {section.items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path as never}
                  className="block py-1.5 text-[13px] text-muted-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
