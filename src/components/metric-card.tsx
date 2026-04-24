import * as React from "react";
import { Text, View } from "react-native";

import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        flexBasis: "47%",
        flexGrow: 1,
        gap: spacing.xs,
        minHeight: 96,
        padding: spacing.lg,
      }}
    >
      <Text selectable style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: colors.text,
          fontSize: 28,
          fontVariant: ["tabular-nums"],
          fontWeight: "800",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

