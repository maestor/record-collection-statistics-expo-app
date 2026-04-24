import { translate } from "@/localization/i18n";

const numberFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const currencyFormatter = new Intl.NumberFormat("fi-FI", {
  currency: "EUR",
  maximumFractionDigits: 2,
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatCount(value: number | null | undefined): string {
  return typeof value === "number" ? numberFormatter.format(value) : translate("common.unknown");
}

export function formatCompactCount(value: number | null | undefined): string {
  return typeof value === "number" ? compactNumberFormatter.format(value) : translate("common.unknown");
}

export function formatCurrency(value: number | null | undefined): string {
  return typeof value === "number" ? currencyFormatter.format(value) : translate("common.unknown");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return translate("common.unknown");
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? translate("common.unknown") : dateFormatter.format(date);
}

export function formatYear(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "" || value === 0 || value === "0") {
    return translate("common.unknown");
  }

  return String(value);
}

export function joinValues(values: readonly string[] | null | undefined): string {
  return values && values.length > 0 ? values.join(", ") : translate("common.unknown");
}
