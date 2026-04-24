import * as React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { useDashboardStatsQuery, useHealthQuery } from "@/api/queries";
import { BreakdownList } from "@/components/breakdown-list";
import { Button } from "@/components/button";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCount, formatDate, formatYear } from "@/utils/format";
import { getErrorMessage } from "@/api/client";

export function DashboardScreen() {
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
          message="Loading the local collection cache and dashboard statistics."
          title="Loading collection"
          tone="loading"
        />
      </ScrollView>
    );
  }

  if (healthQuery.isError || dashboardQuery.isError || !dashboard) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          actionLabel="Try again"
          message={getErrorMessage(healthQuery.error ?? dashboardQuery.error)}
          onAction={refresh}
          title="Dashboard unavailable"
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
          Collection cache is {healthQuery.data?.ok ? "healthy" : "unavailable"}
        </Text>
        <Text selectable style={{ color: colors.primarySoft, fontSize: 15, lineHeight: 22 }}>
          Last successful sync {formatDate(healthQuery.data?.database.lastSuccessfulSyncAt)}.
        </Text>
      </View>

      <Section title="Overview">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          <MetricCard label="Collection items" value={formatCount(summary.totals.collectionItems)} />
          <MetricCard label="Releases" value={formatCount(summary.totals.releases)} />
          <MetricCard label="Artists" value={formatCount(summary.totals.uniqueArtists)} />
          <MetricCard label="Labels" value={formatCount(summary.totals.labels)} />
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
            Added from {formatDate(summary.addedRange.first)} to {formatDate(summary.addedRange.last)}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
            Release years {formatYear(summary.releaseYearRange.min)} to{" "}
            {formatYear(summary.releaseYearRange.max)}
          </Text>
        </View>
        <Link href="/records" asChild>
          <Button accessibilityLabel="Browse records" label="Browse records" />
        </Link>
      </Section>

      <BreakdownList dimension="artist" items={dashboard.topArtists} title="Top artists" />
      <BreakdownList dimension="label" items={dashboard.labels} title="Labels" />
      <BreakdownList dimension="format" items={dashboard.formats} title="Formats" />
      <BreakdownList dimension="genre" items={dashboard.genres} title="Genres" />
      <BreakdownList dimension="style" items={dashboard.styles} title="Styles" />
      <BreakdownList dimension="country" items={dashboard.countries} title="Countries" />
      <BreakdownList dimension="added_year" items={dashboard.addedYears} title="Added years" />
    </ScrollView>
  );
}

