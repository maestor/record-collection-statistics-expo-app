import * as React from "react";
import { Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type SectionProps = React.PropsWithChildren<{
  title: string;
}>;

export function Section({ children, title }: SectionProps) {
  return (
    <View style={{ gap: spacing.md }}>
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

