import * as React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { useDashboardStatsQuery, useHealthQuery } from "@/api/queries";
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
  const healthQuery = useHealthQuery();
  const dashboardQuery = useDashboardStatsQuery(8);
  const isRefreshing = healthQuery.isFetching || dashboardQuery.isFetching;
  const dashboard = dashboardQuery.data?.data;

  const refresh = React.useCallback(() => {
    void healthQuery.refetch();
    void dashboardQuery.refetch();
  }, [dashboardQuery, healthQuery]);

  if (healthQuery.isLoading || dashboardQuery.isLoading) {
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

  if (healthQuery.isError || dashboardQuery.isError || !dashboard) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(healthQuery.error ?? dashboardQuery.error)}
          onAction={refresh}
          title={t("dashboard.errorTitle")}
          tone="error"
        />
      </ScrollView>
    );
  }

  const { summary } = dashboard;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl onRefresh={refresh} refreshing={isRefreshing} />}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      <View
        style={{
          backgroundColor: colors.primaryDark,
          borderCurve: "continuous",
          borderRadius: radius.md,
          gap: spacing.sm,
          padding: spacing.lg,
        }}
      >
        <Text selectable style={{ color: colors.surface, fontSize: 18, fontWeight: "800" }}>
          {healthQuery.data?.ok
            ? t("dashboard.healthStatusHealthy")
            : t("dashboard.healthStatusUnavailable")}
        </Text>
        <Text selectable style={{ color: colors.primarySoft, fontSize: 15, lineHeight: 22 }}>
          {t("dashboard.syncLastSuccessful", {
            date: formatDate(healthQuery.data?.database.lastSuccessfulSyncAt),
          })}
        </Text>
      </View>

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

      <BreakdownList dimension="artist" items={dashboard.topArtists} title={t("dimensions.artist")} />
      <BreakdownList dimension="label" items={dashboard.labels} title={t("dimensions.label")} />
      <BreakdownList dimension="format" items={dashboard.formats} title={t("dimensions.format")} />
      <BreakdownList dimension="genre" items={dashboard.genres} title={t("dimensions.genre")} />
      <BreakdownList dimension="style" items={dashboard.styles} title={t("dimensions.style")} />
      <BreakdownList dimension="country" items={dashboard.countries} title={t("dimensions.country")} />
      <BreakdownList dimension="added_year" items={dashboard.addedYears} title={t("dimensions.added_year")} />
    </ScrollView>
  );
}
