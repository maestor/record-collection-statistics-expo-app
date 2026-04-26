import { colors } from "@/theme/colors";
import type { BreakdownItem } from "@/api/types";
import type { StatisticDimension } from "./statistics-helpers";

type CategoricalStatisticDimension = Exclude<StatisticDimension, "added_year">;

export type StatisticsChartItem = {
  color: string;
  percentage: number;
  releaseCount: number;
  value: string;
};

type CategoricalChartRemainder = {
  itemCount: number;
  releaseCount: number;
};

type CategoricalChartData = {
  chartItems: StatisticsChartItem[];
  remainder: CategoricalChartRemainder | null;
};

const chartColors = colors.chartPalette;
const categoricalChartLimits: Record<CategoricalStatisticDimension, number> = {
  artist: 15,
  country: 8,
  format: 8,
  genre: 8,
  label: 15,
  style: 15,
};
const dimensionsWithoutOtherSlice = new Set<CategoricalStatisticDimension>([
  "artist",
  "label",
  "style",
]);

export const getCategoricalChartLimit = (
  dimension: CategoricalStatisticDimension,
): number => categoricalChartLimits[dimension];

export const usesOtherSliceInCategoricalChart = (
  dimension: CategoricalStatisticDimension,
): boolean => !dimensionsWithoutOtherSlice.has(dimension);

export const buildCategoricalChartData = (
  dimension: CategoricalStatisticDimension,
  items: readonly BreakdownItem[],
  otherLabel: string,
): CategoricalChartData => {
  const chartLimit = getCategoricalChartLimit(dimension);
  const includeOtherSlice = usesOtherSliceInCategoricalChart(dimension);
  const sortedItems = [...items].sort(
    (left, right) => right.releaseCount - left.releaseCount,
  );
  const topItems = sortedItems.slice(0, chartLimit);
  const remainingItems = sortedItems.slice(chartLimit);
  const otherReleaseCount = remainingItems.reduce(
    (sum, item) => sum + item.releaseCount,
    0,
  );
  const totalReleaseCount = sortedItems.reduce(
    (sum, item) => sum + item.releaseCount,
    0,
  );

  const chartItems = topItems.map((item, index) => ({
    color: chartColors[index % chartColors.length]!,
    percentage: getPercentage(item.releaseCount, totalReleaseCount),
    releaseCount: item.releaseCount,
    value: item.value,
  }));

  if (includeOtherSlice && otherReleaseCount > 0) {
    chartItems.push({
      color: colors.textMuted,
      percentage: getPercentage(otherReleaseCount, totalReleaseCount),
      releaseCount: otherReleaseCount,
      value: otherLabel,
    });
  }

  return {
    chartItems,
    remainder:
      !includeOtherSlice && remainingItems.length > 0
        ? {
            itemCount: remainingItems.length,
            releaseCount: otherReleaseCount,
          }
        : null,
  };
};

export const buildYearChartItems = (
  items: readonly BreakdownItem[],
): StatisticsChartItem[] => {
  const totalReleaseCount = items.reduce(
    (sum, item) => sum + item.releaseCount,
    0,
  );

  return [...items]
    .sort((left, right) => Number(right.value) - Number(left.value))
    .map((item) => ({
      color: colors.primary,
      percentage: getPercentage(item.releaseCount, totalReleaseCount),
      releaseCount: item.releaseCount,
      value: item.value,
    }));
};

export const getPercentage = (count: number, total: number): number => {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 1000) / 10;
};
