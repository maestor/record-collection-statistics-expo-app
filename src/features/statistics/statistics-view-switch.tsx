import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { StatisticsView } from "./statistics-helpers";

type StatisticsViewSwitchProps = {
  onChange: (view: StatisticsView) => void;
  value: StatisticsView;
};

const viewOrder: readonly StatisticsView[] = ["list", "charts"];

export const StatisticsViewSwitch = ({
  onChange,
  value,
}: StatisticsViewSwitchProps) => {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t("statistics.viewPickerLabel")}
      style={{
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.lg,
        borderWidth: 1,
        flexDirection: "row",
        padding: 2,
      }}
    >
      {viewOrder.map((view) => {
        const isSelected = value === view;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={isSelected ? { selected: true } : undefined}
            key={view}
            onPress={() => onChange(view)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: isSelected
                ? colors.primary
                : pressed
                  ? colors.surface
                  : "transparent",
              borderCurve: "continuous",
              borderRadius: radius.md,
              flex: 1,
              justifyContent: "center",
              minHeight: 40,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            })}
          >
            <Text
              selectable
              style={{
                color: isSelected ? colors.primaryDark : colors.text,
                fontSize: 15,
                fontWeight: "800",
              }}
            >
              {t(
                view === "list"
                  ? "statistics.viewList"
                  : "statistics.viewCharts",
              )}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
