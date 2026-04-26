import * as React from "react";
import { ScrollView } from "react-native";

import { useBreakdownQuery } from "@/api/queries";
import type { BreakdownDimension } from "@/api/types";
import { BreakdownList } from "@/components/breakdown-list";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { screenStyles } from "@/theme/styles";
import { getErrorMessage } from "@/api/client";
import { getBreakdownTitle } from "./dashboard-helpers";

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
          title={getBreakdownTitle(dimension)}
        />
      )}
    </ScrollView>
  );
};
