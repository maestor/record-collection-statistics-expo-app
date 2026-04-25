import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useDashboardStatsQuery } from "@/api/queries";
import type { BreakdownDimension, BreakdownItem } from "@/api/types";
import { getErrorMessage } from "@/api/client";
import { BreakdownList } from "@/components/breakdown-list";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function HighlightsScreen() {
  const { t } = useTranslation();
  const dashboardQuery = useDashboardStatsQuery(8);
  const [selectedHighlight, setSelectedHighlight] = React.useState<BreakdownDimension>("artist");

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

  if (dashboardQuery.isError) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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
    { dimension: "artist", items: dashboard.topArtists, title: t("dimensions.artist") },
    { dimension: "label", items: dashboard.labels, title: t("dimensions.label") },
    { dimension: "format", items: dashboard.formats, title: t("dimensions.format") },
    { dimension: "genre", items: dashboard.genres, title: t("dimensions.genre") },
    { dimension: "style", items: dashboard.styles, title: t("dimensions.style") },
    { dimension: "country", items: dashboard.countries, title: t("dimensions.country") },
    { dimension: "added_year", items: dashboard.addedYears, title: t("dimensions.added_year") },
  ];
  const activeHighlight = highlightOptions.find((option) => option.dimension === selectedHighlight)!;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
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
    </ScrollView>
  );
}
