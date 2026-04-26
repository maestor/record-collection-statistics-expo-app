import type { BreakdownDimension } from "@/api/types";
import { translate } from "@/localization/i18n";

const supportedBreakdownDimensions = new Set<BreakdownDimension>([
  "artist",
  "label",
  "format",
  "genre",
  "style",
  "country",
  "release_year",
  "added_year",
]);

export const getBreakdownTitle = (dimension: BreakdownDimension): string =>
  translate(`dimensions.${dimension}` as const);

export const isBreakdownDimension = (
  value: string,
): value is BreakdownDimension =>
  supportedBreakdownDimensions.has(value as BreakdownDimension);
