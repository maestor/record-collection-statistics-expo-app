import * as React from "react";
import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { radius } from "@/theme/colors";
import { cardFrameStyle } from "@/theme/styles";

type PanelProps = Omit<ViewProps, "style"> & {
  backgroundColor: string;
  borderColor: string;
  cornerRadius?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
};

export const Panel = ({
  backgroundColor,
  borderColor,
  children,
  cornerRadius = "md",
  style,
  ...props
}: PanelProps) => {
  return (
    <View
      style={[
        cardFrameStyle,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius[cornerRadius],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
