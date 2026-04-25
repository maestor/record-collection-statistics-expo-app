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

export const HighlightsScreen = () => {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const [selectedHighlight, setSelectedHighlight] =
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
  const highlightOptions: {
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
  const activeHighlight = highlightOptions.find(
    (option) => option.dimension === selectedHighlight,
  )!;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <View
        accessibilityLabel={t("dashboard.pickerLabel")}
        style={wrapRowStyle}
      >
        {highlightOptions.map((option) => {
          const isSelected = option.dimension === activeHighlight.dimension;

          return (
            <Chip
              key={option.dimension}
              label={option.title}
              onPress={() => setSelectedHighlight(option.dimension)}
              selected={isSelected}
            />
          );
        })}
      </View>
      <BreakdownList
        dimension={activeHighlight.dimension}
        items={activeHighlight.items}
        title={activeHighlight.title}
        withSection={false}
      />
    </ScrollView>
  );
};
