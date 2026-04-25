import * as React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { useDashboardStatsQuery } from "@/api/queries";
import { BreakdownRow } from "@/components/breakdown-list";
import { Button } from "@/components/button";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { screenStyles } from "@/theme/styles";
import { formatCount, formatCurrency, formatDate } from "@/utils/format";
import { getErrorMessage } from "@/api/client";

export const DashboardScreen = () => {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const isRefreshing = dashboardQuery.isFetching;

  const refresh = React.useCallback(() => {
    void dashboardQuery.refetch();
  }, [dashboardQuery]);

  if (dashboardQuery.isLoading) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
        <StatusMessage
          message={t("dashboard.loadingMessage")}
          title={t("dashboard.loadingTitle")}
          tone="loading"
        />
      </ScrollView>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
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

  const dashboard = dashboardQuery.data!.data;
  const { summary } = dashboard;
  const topBreakdownRows = [
    dashboard.topArtists[0]
      ? {
          count: dashboard.topArtists[0].releaseCount,
          label: t("dashboard.topArtistSummary", {
            value: dashboard.topArtists[0].value,
          }),
        }
      : null,
    dashboard.formats[0]
      ? {
          count: dashboard.formats[0].releaseCount,
          label: t("dashboard.topFormatSummary", {
            value: dashboard.formats[0].value,
          }),
        }
      : null,
  ].filter((row) => row !== null);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
      }
      style={screenStyles.scrollView}
      contentContainerStyle={[screenStyles.content, { flexGrow: 1 }]}
    >
      <Section style={{ flex: 1 }} title={t("dashboard.overviewTitle")}>
        <View style={{ flex: 1, gap: spacing.md }}>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}
          >
            <MetricCard
              label={t("dashboard.metricCollectionItems")}
              value={formatCount(summary.totals.releases)}
            />
            <MetricCard
              label={t("dashboard.metricMedianValue")}
              value={formatCurrency(summary.collectionValue.median)}
            />
            <MetricCard
              label={t("dashboard.metricArtists")}
              value={formatCount(summary.totals.uniqueArtists)}
            />
            <MetricCard
              label={t("dashboard.metricLabels")}
              value={formatCount(summary.totals.labels)}
            />
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
              {t("dashboard.overviewAddedRange", {
                first: formatDate(summary.addedRange.first),
                last: formatDate(summary.addedRange.last),
              })}
            </Text>
          </View>
          <Link href="/statistics" asChild>
            <Button
              accessibilityLabel={t("dashboard.statisticsButton")}
              label={t("dashboard.statisticsButton")}
              variant="secondary"
            />
          </Link>
          <Link href="/records" asChild>
            <Button
              accessibilityLabel={t("dashboard.browseRecords")}
              label={t("dashboard.browseRecords")}
            />
          </Link>
          <View style={{ gap: spacing.sm, marginTop: "auto" }}>
            {topBreakdownRows.map((row) => (
              <BreakdownRow
                count={row.count}
                key={row.label}
                label={row.label}
                max={row.count}
              />
            ))}
          </View>
        </View>
      </Section>
    </ScrollView>
  );
};
