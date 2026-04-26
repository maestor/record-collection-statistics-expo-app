import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Panel } from "@/components/panel";
import { SelectionTrigger } from "@/components/selection-trigger";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { sectionTitleStyle } from "@/theme/styles";
import type { StatisticDimension } from "./statistics-helpers";

type StatisticOption = {
  dimension: StatisticDimension;
  title: string;
};

type StatisticsDimensionSelectorProps = {
  onChange: (dimension: StatisticDimension) => void;
  options: readonly StatisticOption[];
  value: StatisticDimension;
};

export const StatisticsDimensionSelector = ({
  onChange,
  options,
  value,
}: StatisticsDimensionSelectorProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const activeOption = options.find((option) => option.dimension === value)!;

  return (
    <>
      <SelectionTrigger
        accessibilityLabel={t("statistics.currentDimensionLabel", {
          title: activeOption.title,
        })}
        actionLabel={t("statistics.changeDimension")}
        label={activeOption.title}
        onPress={() => setIsOpen(true)}
      />
      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <View
          style={{
            backgroundColor: "rgba(3, 31, 52, 0.72)",
            flex: 1,
            justifyContent: "center",
            padding: spacing.lg,
            paddingVertical: spacing.xl,
          }}
        >
          <Panel
            accessibilityLabel={t("statistics.selectorLabel")}
            backgroundColor={colors.surface}
            borderColor={colors.border}
            cornerRadius="lg"
            style={{ gap: spacing.lg, maxHeight: "80%", padding: spacing.lg }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: spacing.md,
                justifyContent: "space-between",
              }}
            >
              <Text style={[sectionTitleStyle, { flex: 1 }]}>
                {t("statistics.selectorTitle")}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOpen(false)}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: pressed
                    ? colors.surfaceMuted
                    : "transparent",
                  borderColor: colors.border,
                  borderCurve: "continuous",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  justifyContent: "center",
                  minHeight: 40,
                  paddingHorizontal: spacing.md,
                })}
              >
                <Text
                  selectable
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {t("statistics.closeSelector")}
                </Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={{ gap: spacing.sm }}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const isSelected = option.dimension === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={
                      isSelected ? { selected: true } : undefined
                    }
                    key={option.dimension}
                    onPress={() => {
                      onChange(option.dimension);
                      setIsOpen(false);
                    }}
                    style={({ pressed }) => ({
                      alignItems: "center",
                      backgroundColor: isSelected
                        ? colors.primary
                        : pressed
                          ? colors.surfaceMuted
                          : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderCurve: "continuous",
                      borderRadius: radius.md,
                      borderWidth: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      minHeight: 44,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    })}
                  >
                    <Text
                      selectable
                      style={{
                        color: isSelected ? colors.primaryDark : colors.text,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      {option.title}
                    </Text>
                    {isSelected && (
                      <Text
                        selectable
                        style={{
                          color: colors.primaryDark,
                          fontSize: 13,
                          fontWeight: "800",
                        }}
                      >
                        {t("statistics.selectedDimension")}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Panel>
        </View>
      </Modal>
    </>
  );
};
