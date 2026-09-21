/** API amounts are major units (cedis / dollars). DB stores minor units (pesewas / cents). */

export type CurrencyCode = "GHS" | "USD";

export const MINOR_PER_MAJOR = 100;

export function majorToMinor(major: number): number {
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * MINOR_PER_MAJOR);
}

export function minorToMajor(minor: number): number {
  if (!Number.isFinite(minor)) return 0;
  return minor / MINOR_PER_MAJOR;
}

export function currencySymbol(currency: CurrencyCode): string {
  return currency === "GHS" ? "GH₵" : "$";
}

export function currencyLabel(currency: CurrencyCode): string {
  return currency === "GHS" ? "Ghana cedis (GHS)" : "US dollars (USD)";
}

/** Format a major-unit amount for display (GraphQL values). */
export function formatMoneyMajor(major: number, currency: CurrencyCode): string {
  const formatted = major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(currency)}${formatted}`;
}
