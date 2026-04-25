import * as React from "react";
import {
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { filterChipStyle } from "@/theme/styles";

type SelectionTriggerProps = {
  accessibilityLabel: string;
  actionLabel: string;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const SelectionTrigger = ({
  accessibilityLabel,
  actionLabel,
  label,
  onPress,
  style,
}: SelectionTriggerProps) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        filterChipStyle,
        {
          alignItems: "center",
          backgroundColor: pressed ? colors.surface : colors.surfaceMuted,
          borderColor: colors.border,
          flexDirection: "row",
          justifyContent: "space-between",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colors.text,
          flex: 1,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 13,
          fontWeight: "800",
          marginLeft: spacing.md,
        }}
      >
        {actionLabel}
      </Text>
    </Pressable>
  );
};
