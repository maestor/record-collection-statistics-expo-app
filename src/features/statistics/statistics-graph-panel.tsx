import * as React from "react";
import {
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  LineChart,
  PieChart,
  type lineDataItem,
  type pieDataItem,
} from "react-native-gifted-charts";

import { useBreakdownQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { surfaceCardStyle } from "@/theme/styles";
import { formatCount } from "@/utils/format";
import type { StatisticDimension } from "./statistics-model";
import {
  buildCategoricalChartData,
  buildYearChartItems,
  getCategoricalChartLimit,
} from "./statistics-chart-data";

type StatisticsGraphPanelProps = {
  dimension: StatisticDimension;
  title: string;
};

type ChartLegendItem = {
  color: string;
  percentage: number;
  releaseCount: number;
  value: string;
};

const getRemainderCategory = (
  dimension: StatisticDimension,
  t: ReturnType<typeof useTranslation>["t"],
): string => {
  const remainderCategoryByDimension: Record<StatisticDimension, string> = {
    added_year: "",
    artist: t("statistics.otherSummaryArtist"),
    country: "",
    format: "",
    genre: "",
    label: t("statistics.otherSummaryLabel"),
    style: t("statistics.otherSummaryStyle"),
  };

  return remainderCategoryByDimension[dimension];
};

const percentageFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export const StatisticsGraphPanel = ({
  dimension,
  title,
}: StatisticsGraphPanelProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const query = useBreakdownQuery(dimension);
  const chartWidth = Math.max(width - spacing.lg * 3, 240);

  if (query.isLoading) {
    return (
      <StatusMessage
        message={t("statistics.graphLoadingMessage")}
        title={t("statistics.graphLoadingTitle")}
        tone="loading"
      />
    );
  }

  if (query.isError) {
    return (
      <StatusMessage
        actionLabel={t("common.tryAgain")}
        message={getErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title={t("statistics.graphErrorTitle")}
        tone="error"
      />
    );
  }

  const rawItems = query.data!.data;

  if (rawItems.length === 0) {
    return (
      <StatusMessage
        message={t("common.noValuesYet")}
        title={t("statistics.graphEmptyTitle")}
      />
    );
  }

  if (dimension === "added_year") {
    const legendItems = buildYearChartItems(rawItems);
    const scrollableChartWidth = Math.max(
      chartWidth,
      legendItems.length * 72 + spacing.lg * 2,
    );
    const lineData: lineDataItem[] = legendItems.map((item) => ({
      dataPointColor: colors.primary,
      label: item.value,
      value: item.releaseCount,
    }));

    return (
      <StatisticsGraphSection
        accessibilityLabel={t("statistics.chartSectionLabel", { title })}
        chart={
          <ScrollView
            accessibilityLabel={t("statistics.chartScrollLabel", { title })}
            horizontal
            showsHorizontalScrollIndicator={false}
            testID="statistics-line-chart-scroll"
          >
            <View testID="statistics-line-chart">
              <LineChart
                areaChart
                color={colors.primary}
                data={lineData}
                dataPointsColor={colors.primary}
                endFillColor={colors.primary}
                endOpacity={0.08}
                hideDataPoints={false}
                hideRules={false}
                initialSpacing={16}
                noOfSections={4}
                spacing={64}
                startFillColor={colors.primarySoft}
                startOpacity={0.45}
                textColor={colors.textMuted}
                thickness={3}
                width={scrollableChartWidth}
                xAxisColor={colors.border}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 12 }}
                yAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 12 }}
              />
            </View>
          </ScrollView>
        }
        legendItems={legendItems}
        remainderCategory=""
        remainder={null}
        title={title}
      />
    );
  }

  const { chartItems: legendItems, remainder } = buildCategoricalChartData(
    dimension,
    rawItems,
    t("statistics.other"),
  );
  const pieData: pieDataItem[] = legendItems.map((item) => ({
    color: item.color,
    text: item.value,
    value: item.releaseCount,
  }));
  const remainderCategory = getRemainderCategory(dimension, t);

  return (
    <StatisticsGraphSection
      accessibilityLabel={t("statistics.chartSectionLabel", { title })}
      chart={
        <View style={{ alignItems: "center" }} testID="statistics-donut-chart">
          <PieChart
            centerLabelComponent={(selectedIndex: number) => {
              const selectedDonutItem = legendItems[selectedIndex]!;
              const selectedPercentage = percentageFormatter.format(
                selectedDonutItem.percentage,
              );

              return (
                <View
                  accessibilityLabel={t("statistics.donutCenterLabel", {
                    count: formatCount(selectedDonutItem.releaseCount),
                    label: selectedDonutItem.value,
                    percentage: selectedPercentage,
                  })}
                  accessible
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      fontSize: 30,
                      fontWeight: "800",
                    }}
                  >
                    {`${selectedPercentage}%`}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {selectedDonutItem.value}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 12,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatCount(selectedDonutItem.releaseCount)}
                  </Text>
                </View>
              );
            }}
            data={pieData}
            donut
            focusOnPress
            focusedPieIndex={0}
            innerCircleColor={colors.surface}
            innerRadius={Math.max(48, 84 - getCategoricalChartLimit(dimension))}
            radius={112}
            showText={false}
            strokeColor={colors.surface}
            strokeWidth={2}
            toggleFocusOnPress={false}
          />
        </View>
      }
      legendItems={legendItems}
      remainderCategory={remainderCategory}
      remainder={remainder}
      title={title}
    />
  );
};

const StatisticsGraphSection = ({
  accessibilityLabel,
  chart,
  legendItems,
  remainderCategory,
  remainder,
  title,
}: {
  accessibilityLabel: string;
  chart: React.ReactNode;
  legendItems: readonly ChartLegendItem[];
  remainderCategory: string;
  remainder: { itemCount: number; releaseCount: number } | null;
  title: string;
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ gap: spacing.md }}>
      <View
        accessibilityLabel={accessibilityLabel}
        accessible
        style={[surfaceCardStyle, { gap: spacing.lg, padding: spacing.lg }]}
      >
        <Text
          selectable
          style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}
        >
          {t("statistics.chartTitle", { title })}
        </Text>
        {chart}
        <View style={{ gap: spacing.sm }}>
          <Text
            selectable
            style={{ color: colors.textMuted, fontSize: 14, fontWeight: "700" }}
          >
            {t("statistics.chartLegendTitle")}
          </Text>
          {remainder && (
            <Text
              selectable
              style={{
                color: colors.textMuted,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t("statistics.otherSummary", {
                category: remainderCategory,
                count: formatCount(remainder.itemCount),
                total: formatCount(remainder.releaseCount),
              })}
            </Text>
          )}
          <View style={{ gap: spacing.sm }}>
            {legendItems.map((item) => {
              const percentage = percentageFormatter.format(item.percentage);

              return (
                <View
                  accessibilityLabel={t("statistics.legendItemAccessibilityLabel", {
                    count: formatCount(item.releaseCount),
                    label: item.value,
                    percentage,
                  })}
                  accessible
                  key={item.value}
                  style={[
                    surfaceCardStyle,
                    {
                      alignItems: "center",
                      flexDirection: "row",
                      gap: spacing.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: item.color,
                      borderColor: colors.surfaceMuted,
                      borderWidth: 1,
                      borderCurve: "continuous",
                      borderRadius: radius.sm,
                      height: 14,
                      width: 14,
                    }}
                  />
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {t("statistics.legendItemValue", {
                      count: formatCount(item.releaseCount),
                      percentage,
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
