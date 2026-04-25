import * as React from "react";
import { ScrollView, View } from "react-native";

import { useDashboardStatsQuery } from "@/api/queries";
import type { BreakdownDimension, BreakdownItem } from "@/api/types";
import { getErrorMessage } from "@/api/client";
import { BreakdownList } from "@/components/breakdown-list";
import { Chip } from "@/components/chip";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { screenStyles, wrapRowStyle } from "@/theme/styles";

export const StatisticsScreen = () => {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const [selectedStatistic, setSelectedStatistic] =
    React.useState<BreakdownDimension>("artist");

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

  const dashboard = dashboardQuery.data!.data;
  const statisticOptions: {
    dimension: BreakdownDimension;
    items: readonly BreakdownItem[];
    title: string;
  }[] = [
    {
      dimension: "artist",
      items: dashboard.topArtists,
      title: t("dimensions.artist"),
    },
    {
      dimension: "label",
      items: dashboard.labels,
      title: t("dimensions.label"),
    },
    {
      dimension: "format",
      items: dashboard.formats,
      title: t("dimensions.format"),
    },
    {
      dimension: "genre",
      items: dashboard.genres,
      title: t("dimensions.genre"),
    },
    {
      dimension: "style",
      items: dashboard.styles,
      title: t("dimensions.style"),
    },
    {
      dimension: "country",
      items: dashboard.countries,
      title: t("dimensions.country"),
    },
    {
      dimension: "added_year",
      items: dashboard.addedYears,
      title: t("dimensions.added_year"),
    },
  ];
  const activeStatistic = statisticOptions.find(
    (option) => option.dimension === selectedStatistic,
  )!;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <View
        accessibilityLabel={t("statistics.pickerLabel")}
        style={wrapRowStyle}
      >
        {statisticOptions.map((option) => {
          const isSelected = option.dimension === activeStatistic.dimension;

          return (
            <Chip
              key={option.dimension}
              label={option.title}
              onPress={() => setSelectedStatistic(option.dimension)}
              selected={isSelected}
            />
          );
        })}
      </View>
      <BreakdownList
        dimension={activeStatistic.dimension}
        items={activeStatistic.items}
        title={activeStatistic.title}
        withSection={false}
      />
    </ScrollView>
  );
};
