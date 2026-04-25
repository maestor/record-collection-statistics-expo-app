import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import {
  BreakdownScreen,
  isBreakdownDimension,
} from "@/features/dashboard/breakdown-screen";
import { StatusMessage } from "@/components/status-message";
import { translate } from "@/localization/i18n";
import { spacing } from "@/theme/spacing";

const BreakdownRoute = () => {
  const { dimension } = useLocalSearchParams<{ dimension: string }>();

  if (!isBreakdownDimension(dimension)) {
    return (
      <StatusMessage
        message={translate("breakdowns.unsupportedMessage")}
        title={translate("breakdowns.unsupportedTitle")}
        tone="error"
      />
    );
  }

  return <BreakdownScreen dimension={dimension} />;
};

export const unstable_settings = {
  contentContainerStyle: { padding: spacing.lg },
};

export default BreakdownRoute;
