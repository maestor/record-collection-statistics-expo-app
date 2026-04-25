import * as React from "react";
import { ScrollView } from "react-native";

import { useBreakdownQuery } from "@/api/queries";
import type { BreakdownDimension } from "@/api/types";
import { BreakdownList } from "@/components/breakdown-list";
import { StatusMessage } from "@/components/status-message";
import { translate, useTranslation } from "@/localization/i18n";
import { screenStyles } from "@/theme/styles";
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

const titleForDimension = (dimension: BreakdownDimension): string =>
  translate(`dimensions.${dimension}` as const);

export const isBreakdownDimension = (
  value: string,
): value is BreakdownDimension =>
  supportedDimensions.has(value as BreakdownDimension);

export const BreakdownScreen = ({
  dimension,
}: {
  dimension: BreakdownDimension;
}) => {
  const { t } = useTranslation();
  const query = useBreakdownQuery(dimension);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      {query.isLoading && (
        <StatusMessage
          message={t("breakdowns.loadingMessage")}
          title={t("breakdowns.loadingTitle")}
          tone="loading"
        />
      )}
      {query.isError && (
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(query.error)}
          onAction={() => void query.refetch()}
          title={t("navigation.breakdown")}
          tone="error"
        />
      )}
      {query.data && (
        <BreakdownList
          items={query.data.data}
          title={titleForDimension(dimension)}
        />
      )}
    </ScrollView>
  );
};
