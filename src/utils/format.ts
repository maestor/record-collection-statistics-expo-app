import { translate } from "@/localization/i18n";

const numberFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatCount(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return translate("common.unknown");
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? translate("common.unknown") : dateFormatter.format(date);
}

export function formatYear(value: number | null): string {
  if (value === null || value === 0) {
    return translate("common.unknown");
  }

  return String(value);
}

export function joinValues(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : translate("common.unknown");
}
