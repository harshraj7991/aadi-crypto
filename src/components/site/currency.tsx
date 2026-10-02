import { createContext, useContext, useState, type ReactNode } from "react";
import type { Currency } from "@/data/market";

type Ctx = { currency: Currency; setCurrency: (c: Currency) => void };

const CurrencyContext = createContext<Ctx>({ currency: "USD", setCurrency: () => {} });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div
      role="group"
      aria-label="Display currency"
      className="flex items-center rounded-sm border border-border bg-background p-0.5"
    >
      {(["USD", "INR"] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            currency === c
              ? "bg-ink text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
