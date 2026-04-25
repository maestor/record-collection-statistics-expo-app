import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = Omit<PressableProps, "style"> & {
  isLoading?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

const variantStyles = {
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    color: colors.text,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    color: colors.text,
  },
} as const;

export const Button = ({
  disabled,
  isLoading = false,
  label,
  style,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const styles = variantStyles[variant];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          borderCurve: "continuous",
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "center",
          minHeight: 48,
          opacity: isDisabled ? 0.55 : pressed ? 0.8 : 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        style,
      ]}
      {...props}
    >
      {isLoading && <ActivityIndicator color={styles.color} />}
      <Text
        style={{
          color: styles.color,
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};
