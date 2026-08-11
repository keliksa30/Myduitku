// Currency formatting — display only, no conversion (per PRD non-goal).
// Intl.NumberFormat per locale; IDR default.

export const CURRENCIES = ["IDR", "USD", "EUR", "SGD", "JPY", "MYR", "GBP", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Locale per currency — best match for idiomatic symbol+separator output.
const LOCALE: Record<Currency, string> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "de-DE",
  SGD: "en-SG",
  JPY: "ja-JP",
  MYR: "ms-MY",
  GBP: "en-GB",
  AUD: "en-AU",
};

const DECIMALS: Record<Currency, number> = {
  IDR: 0,
  USD: 2,
  EUR: 2,
  SGD: 2,
  JPY: 0,
  MYR: 2,
  GBP: 2,
  AUD: 2,
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: Currency): Intl.NumberFormat {
  const key = `${currency}:${DECIMALS[currency]}`;
  let f = formatterCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: DECIMALS[currency],
      maximumFractionDigits: DECIMALS[currency],
    });
    formatterCache.set(key, f);
  }
  return f;
}

// 50000, "IDR" → "Rp 50.000"   (thin space, per DESIGN.md microcopy)
export function formatMoney(amount: number, currency: Currency = "IDR"): string {
  // Intl id-ID emits U+202F (narrow no-break space) — normalize to plain space per DESIGN.md copy.
  return getFormatter(currency).format(amount).replace(/\u202F|\u00A0/g, " ");
}

// Currency symbol only, e.g. "Rp", "$" — for compact contexts.
export function currencySymbol(currency: Currency): string {
  return getFormatter(currency).formatToParts(0).find((p) => p.type === "currency")?.value ?? "";
}
