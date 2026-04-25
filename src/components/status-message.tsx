import * as React from "react";
import { ActivityIndicator, Text } from "react-native";

import { Button } from "./button";
import { Panel } from "./panel";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type StatusMessageProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  tone?: "error" | "info" | "loading";
  title: string;
};

export const StatusMessage = ({
  actionLabel,
  message,
  onAction,
  title,
  tone = "info",
}: StatusMessageProps) => {
  const isError = tone === "error";
  const action =
    actionLabel && onAction
      ? { label: actionLabel, onPress: onAction }
      : undefined;

  return (
    <Panel
      accessibilityRole={isError ? "alert" : undefined}
      accessible={isError}
      backgroundColor={isError ? colors.dangerSoft : colors.surfaceMuted}
      borderColor={isError ? colors.danger : colors.border}
      style={{ gap: spacing.md, padding: spacing.lg }}
    >
      {tone === "loading" && <ActivityIndicator color={colors.primary} />}
      <Text
        selectable
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
      <Text
        selectable
        style={{
          color: isError ? colors.text : colors.textMuted,
          fontSize: 15,
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="danger"
        />
      )}
    </Panel>
  );
};
