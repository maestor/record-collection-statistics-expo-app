import * as React from "react";
import { ScrollView } from "react-native";

import { useDashboardStatsQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { BreakdownList } from "@/components/breakdown-list";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { screenStyles } from "@/theme/styles";
import {
  buildStatisticOptions,
  type StatisticDimension,
  type StatisticsView,
} from "./statistics-helpers";
import { StatisticsDimensionSelector } from "./statistics-dimension-selector";
import { StatisticsGraphPanel } from "./statistics-graph-panel";
import { StatisticsViewSwitch } from "./statistics-view-switch";

export const StatisticsScreen = () => {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const [selectedStatistic, setSelectedStatistic] =
    React.useState<StatisticDimension>("artist");
  const [selectedView, setSelectedView] =
    React.useState<StatisticsView>("list");

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
          onAction={() => void dashboardQuery.refetch()}
          title={t("dashboard.errorTitle")}
          tone="error"
        />
      </ScrollView>
    );
  }

  if (!dashboardQuery.data) {
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

  const dashboard = dashboardQuery.data.data;
  const statisticOptions = buildStatisticOptions(dashboard);
  const activeStatistic = statisticOptions.find(
    (option) => option.dimension === selectedStatistic,
  )!;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <StatisticsViewSwitch onChange={setSelectedView} value={selectedView} />
      <StatisticsDimensionSelector
        onChange={setSelectedStatistic}
        options={statisticOptions}
        value={activeStatistic.dimension}
      />
      {selectedView === "list" ? (
        <BreakdownList
          dimension={activeStatistic.dimension}
          items={activeStatistic.items}
          title={activeStatistic.title}
          withSection={false}
        />
      ) : (
        <StatisticsGraphPanel
          dimension={activeStatistic.dimension}
          title={activeStatistic.title}
        />
      )}
    </ScrollView>
  );
};
