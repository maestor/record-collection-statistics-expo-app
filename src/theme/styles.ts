import type { TextStyle, ViewStyle } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

import { colors, radius } from "./colors";
import { spacing } from "./spacing";

export const screenStyles = {
  content: {
    gap: spacing.xl,
    padding: spacing.lg,
  },
  paddedContent: {
    padding: spacing.lg,
  },
  scrollView: {
    backgroundColor: colors.background,
  },
} satisfies Record<string, ViewStyle>;

export const getSafeAreaPaddingStyle = (insets: EdgeInsets): ViewStyle => ({
  paddingBottom: insets.bottom,
  paddingLeft: insets.left,
  paddingRight: insets.right,
  paddingTop: insets.top,
});

export const cardFrameStyle = {
  borderCurve: "continuous",
  borderRadius: radius.md,
  borderWidth: 1,
} satisfies ViewStyle;

export const surfaceCardStyle = {
  ...cardFrameStyle,
  backgroundColor: colors.surface,
  borderColor: colors.border,
} satisfies ViewStyle;

export const wrapRowStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
} satisfies ViewStyle;

export const sectionTitleStyle = {
  color: colors.text,
  fontSize: 20,
  fontWeight: "800",
} satisfies TextStyle;

export const filterChipStyle = {
  ...cardFrameStyle,
  minHeight: 40,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
} satisfies ViewStyle;
