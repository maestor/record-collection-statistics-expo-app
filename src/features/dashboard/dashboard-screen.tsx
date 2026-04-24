import * as React from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import type { BreakdownDimension, BreakdownItem } from "@/api/types";
import { useDashboardStatsQuery } from "@/api/queries";
import { BreakdownList } from "@/components/breakdown-list";
import { Button } from "@/components/button";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCount, formatDate, formatYear } from "@/utils/format";
import { getErrorMessage } from "@/api/client";

export function DashboardScreen() {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const [selectedHighlight, setSelectedHighlight] = React.useState<BreakdownDimension>("artist");
  const isRefreshing = dashboardQuery.isFetching;
  const dashboard = dashboardQuery.data?.data;

  const refresh = React.useCallback(() => {
    void dashboardQuery.refetch();
  }, [dashboardQuery]);

  if (dashboardQuery.isLoading) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          message={t("dashboard.loadingMessage")}
          title={t("dashboard.loadingTitle")}
          tone="loading"
        />
      </ScrollView>
    );
  }

  if (dashboardQuery.isError || !dashboard) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(dashboardQuery.error)}
          onAction={refresh}
          title={t("dashboard.errorTitle")}
          tone="error"
        />
      </ScrollView>
    );
  }

  const { summary } = dashboard;
  const highlightOptions: {
    dimension: BreakdownDimension;
    items: readonly BreakdownItem[];
    title: string;
  }[] = [
    { dimension: "artist", items: dashboard.topArtists, title: t("dimensions.artist") },
    { dimension: "label", items: dashboard.labels, title: t("dimensions.label") },
    { dimension: "format", items: dashboard.formats, title: t("dimensions.format") },
    { dimension: "genre", items: dashboard.genres, title: t("dimensions.genre") },
    { dimension: "style", items: dashboard.styles, title: t("dimensions.style") },
    { dimension: "country", items: dashboard.countries, title: t("dimensions.country") },
    { dimension: "added_year", items: dashboard.addedYears, title: t("dimensions.added_year") },
  ];
  const activeHighlight =
    highlightOptions.find((option) => option.dimension === selectedHighlight) ?? highlightOptions[0]!;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl onRefresh={refresh} refreshing={isRefreshing} />}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      <Section title={t("dashboard.overviewTitle")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          <MetricCard
            label={t("dashboard.metricCollectionItems")}
            value={formatCount(summary.totals.collectionItems)}
          />
          <MetricCard label={t("dashboard.metricReleases")} value={formatCount(summary.totals.releases)} />
          <MetricCard label={t("dashboard.metricArtists")} value={formatCount(summary.totals.uniqueArtists)} />
          <MetricCard label={t("dashboard.metricLabels")} value={formatCount(summary.totals.labels)} />
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
            {t("dashboard.overviewAddedRange", {
              first: formatDate(summary.addedRange.first),
              last: formatDate(summary.addedRange.last),
            })}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
            {t("dashboard.overviewReleaseYearRange", {
              max: formatYear(summary.releaseYearRange.max),
              min: formatYear(summary.releaseYearRange.min),
            })}
          </Text>
        </View>
        <Link href="/records" asChild>
          <Button accessibilityLabel={t("dashboard.browseRecords")} label={t("dashboard.browseRecords")} />
        </Link>
      </Section>

      <Section title={t("dashboard.highlightsTitle")}>
        <View
          accessibilityLabel={t("dashboard.pickerLabel")}
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
        >
          {highlightOptions.map((option) => {
            const isSelected = option.dimension === activeHighlight.dimension;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option.dimension}
                onPress={() => setSelectedHighlight(option.dimension)}
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderCurve: "continuous",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  minHeight: 40,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSelected ? colors.primaryDark : colors.text,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {option.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <BreakdownList
          dimension={activeHighlight.dimension}
          items={activeHighlight.items}
          title={activeHighlight.title}
          withSection={false}
        />
      </Section>
    </ScrollView>
  );
}
