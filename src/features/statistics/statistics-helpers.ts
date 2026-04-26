import { translate } from "@/localization/i18n";
import type { BreakdownDimension, BreakdownItem, DashboardStats } from "@/api/types";

export type StatisticsView = "list" | "charts";
export type StatisticDimension = Exclude<BreakdownDimension, "release_year">;

type StatisticOption = {
  dimension: StatisticDimension;
  items: readonly BreakdownItem[];
  title: string;
};

const statisticDimensions = [
  "artist",
  "label",
  "format",
  "genre",
  "style",
  "country",
  "added_year",
] as const satisfies readonly StatisticDimension[];

export const getStatisticTitle = (dimension: StatisticDimension): string =>
  translate(`dimensions.${dimension}` as const);

export const getStatisticRemainderCategory = (
  dimension: StatisticDimension,
): string => {
  const remainderCategoryByDimension: Record<StatisticDimension, string> = {
    added_year: "",
    artist: translate("statistics.otherSummaryArtist"),
    country: "",
    format: "",
    genre: "",
    label: translate("statistics.otherSummaryLabel"),
    style: translate("statistics.otherSummaryStyle"),
  };

  return remainderCategoryByDimension[dimension];
};

export const buildStatisticOptions = (
  dashboard: DashboardStats,
): readonly StatisticOption[] => {
  const statisticItems: Record<StatisticDimension, readonly BreakdownItem[]> = {
    added_year: dashboard.addedYears,
    artist: dashboard.topArtists,
    country: dashboard.countries,
    format: dashboard.formats,
    genre: dashboard.genres,
    label: dashboard.labels,
    style: dashboard.styles,
  };

  return statisticDimensions.map((dimension) => ({
    dimension,
    items: statisticItems[dimension],
    title: getStatisticTitle(dimension),
  }));
};
