import * as React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type SectionProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  title: string;
}>;

export function Section({ children, style, title }: SectionProps) {
  return (
    <View style={[{ gap: spacing.md }, style]}>
      <Text
        selectable
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "800",
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
