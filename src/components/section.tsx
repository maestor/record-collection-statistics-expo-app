import * as React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "@/theme/spacing";
import { sectionTitleStyle } from "@/theme/styles";

type SectionProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  title: string;
}>;

export const Section = ({ children, style, title }: SectionProps) => {
  return (
    <View style={[{ gap: spacing.md }, style]}>
      <Text selectable style={sectionTitleStyle}>
        {title}
      </Text>
      {children}
    </View>
  );
};
