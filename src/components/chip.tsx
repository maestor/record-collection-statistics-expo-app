import * as React from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { filterChipStyle } from "@/theme/styles";

type ChipProps = Omit<PressableProps, "style"> & {
  label: string;
  leadingAccessory?: React.ReactNode;
  pressedBackgroundColor?: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Chip = ({
  accessibilityRole = "button",
  label,
  leadingAccessory,
  pressedBackgroundColor,
  selected = false,
  style,
  textStyle,
  ...props
}: ChipProps) => {
  const backgroundColor = selected ? colors.primary : colors.surfaceMuted;
  const borderColor = selected ? colors.primary : colors.border;

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={selected ? { selected: true } : undefined}
      style={({ pressed }) => [
        filterChipStyle,
        {
          alignItems: "center",
          backgroundColor:
            pressed && !selected && pressedBackgroundColor
              ? pressedBackgroundColor
              : backgroundColor,
          borderColor,
          flexDirection: "row",
          gap: leadingAccessory ? spacing.sm : 0,
        },
        style,
      ]}
      {...props}
    >
      {leadingAccessory}
      <Text
        selectable
        style={[
          {
            color: selected ? colors.primaryDark : colors.text,
            fontSize: 14,
            fontWeight: "700",
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
