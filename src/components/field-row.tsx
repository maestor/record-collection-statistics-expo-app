import * as React from "react";
import { Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type FieldRowProps = {
  label: string;
  value: string;
};

export const FieldRow = ({ label, value }: FieldRowProps) => {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        selectable
        style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700" }}
      >
        {label}
      </Text>
      <Text
        selectable
        style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}
      >
        {value}
      </Text>
    </View>
  );
};
