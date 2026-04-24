import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import { BreakdownScreen, isBreakdownDimension } from "@/features/dashboard/breakdown-screen";
import { StatusMessage } from "@/components/status-message";
import { spacing } from "@/theme/spacing";

export default function BreakdownRoute() {
  const { dimension } = useLocalSearchParams<{ dimension: string }>();

  if (!isBreakdownDimension(dimension)) {
    return (
      <StatusMessage
        message="The requested breakdown dimension is not supported."
        title="Unsupported breakdown"
        tone="error"
      />
    );
  }

  return <BreakdownScreen dimension={dimension} />;
}

export const unstable_settings = {
  contentContainerStyle: { padding: spacing.lg },
};

