const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const currencyFormatter = new Intl.NumberFormat("en", {
  currency: "EUR",
  maximumFractionDigits: 2,
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatCount(value: number | null | undefined): string {
  return typeof value === "number" ? numberFormatter.format(value) : "Unknown";
}

export function formatCompactCount(value: number | null | undefined): string {
  return typeof value === "number" ? compactNumberFormatter.format(value) : "Unknown";
}

export function formatCurrency(value: number | null | undefined): string {
  return typeof value === "number" ? currencyFormatter.format(value) : "Unknown";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : dateFormatter.format(date);
}

export function formatYear(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "" || value === 0 || value === "0") {
    return "Unknown";
  }

  return String(value);
}

export function joinValues(values: readonly string[] | null | undefined): string {
  return values && values.length > 0 ? values.join(", ") : "Unknown";
}

