import * as React from "react";
import { ScrollView } from "react-native";

import { useBreakdownQuery } from "@/api/queries";
import type { BreakdownDimension } from "@/api/types";
import { BreakdownList } from "@/components/breakdown-list";
import { StatusMessage } from "@/components/status-message";
import { translate, useTranslation } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { getErrorMessage } from "@/api/client";

const supportedDimensions = new Set<BreakdownDimension>([
  "artist",
  "label",
  "format",
  "genre",
  "style",
  "country",
  "release_year",
  "added_year",
]);

function titleForDimension(dimension: BreakdownDimension): string {
  return translate(`dimensions.${dimension}` as const);
}

export function isBreakdownDimension(value: string): value is BreakdownDimension {
  return supportedDimensions.has(value as BreakdownDimension);
}

export function BreakdownScreen({ dimension }: { dimension: BreakdownDimension }) {
  const { t } = useTranslation();
  const query = useBreakdownQuery(dimension);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      {query.isLoading ? (
        <StatusMessage
          message={t("breakdowns.loadingMessage")}
          title={t("breakdowns.loadingTitle")}
          tone="loading"
        />
      ) : null}
      {query.isError ? (
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(query.error)}
          onAction={() => void query.refetch()}
          title={t("navigation.breakdown")}
          tone="error"
        />
      ) : null}
      {query.data ? (
        <BreakdownList items={query.data.data} title={titleForDimension(dimension)} />
      ) : null}
    </ScrollView>
  );
}
