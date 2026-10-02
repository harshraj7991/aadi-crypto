import { USD_INR, type Currency } from "@/data/market";

export function convert(usd: number, currency: Currency) {
  return currency === "USD" ? usd : usd * USD_INR;
}

export function formatPrice(usd: number, currency: Currency) {
  const value = convert(usd, currency);
  // Sub-cent coins are common once the table carries the real top 100 — SHIB and
  // PEPE trade around $0.000008, which four decimal places renders as $0.0000.
  const absolute = Math.abs(value);
  const digits =
    absolute >= 1 ? 2 : absolute >= 0.01 ? 4 : absolute >= 0.0001 ? 6 : absolute > 0 ? 8 : 2;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(usd: number, currency: Currency) {
  const value = convert(usd, currency);
  const absolute = Math.abs(value);
  const units =
    currency === "INR"
      ? [
          { value: 10_000_000_000_000, suffix: "L Cr" },
          { value: 10_000_000, suffix: "Cr" },
          { value: 100_000, suffix: "L" },
          { value: 1_000, suffix: "K" },
        ]
      : [
          { value: 1_000_000_000_000, suffix: "T" },
          { value: 1_000_000_000, suffix: "B" },
          { value: 1_000_000, suffix: "M" },
          { value: 1_000, suffix: "K" },
        ];
  const unit = units.find((candidate) => absolute >= candidate.value);
  const compactValue = unit ? value / unit.value : value;
  const decimals = Math.abs(compactValue) >= 100 ? 0 : Math.abs(compactValue) >= 10 ? 1 : 2;
  const number = compactValue.toFixed(decimals).replace(/\.0+$|(?<=\.[0-9])0$/, "");
  return `${currency === "INR" ? "₹" : "$"}${number}${unit?.suffix ?? ""}`;
}

export function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
