import * as React from "react";
import { Text, View } from "react-native";

import { getErrorMessage } from "@/api/client";
import { useHealthQuery } from "@/api/queries";
import { Panel } from "@/components/panel";
import { useTranslation } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatDate } from "@/utils/format";

export const CollectionStatusCard = () => {
  const { t } = useTranslation();
  const healthQuery = useHealthQuery();
  const isHealthy = healthQuery.data?.ok === true && !healthQuery.isError;
  const statusLabel = isHealthy
    ? t("dashboard.healthStatusHealthy")
    : t("dashboard.healthStatusUnavailable");
  const message = healthQuery.isLoading
    ? t("dashboard.syncStatusLoading")
    : healthQuery.isError
      ? getErrorMessage(healthQuery.error)
      : healthQuery.data?.database.lastSuccessfulSyncAt
        ? t("dashboard.syncLastSuccessful", {
            date: formatDate(healthQuery.data.database.lastSuccessfulSyncAt),
          })
        : t("dashboard.syncUnavailableMessage");

  return (
    <Panel
      backgroundColor={isHealthy ? colors.surfaceMuted : colors.dangerSoft}
      borderColor={isHealthy ? colors.border : colors.danger}
      style={{ gap: spacing.md, padding: spacing.lg }}
    >
      <View
        style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}
      >
        <View
          accessibilityLabel={statusLabel}
          style={{
            backgroundColor: isHealthy ? colors.success : colors.danger,
            borderRadius: 999,
            height: 10,
            width: 10,
          }}
        />
        <Text
          selectable
          style={{ color: colors.text, fontSize: 15, fontWeight: "800" }}
        >
          {t("dashboard.syncStatusTitle")}
        </Text>
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text
          selectable
          style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}
        >
          {statusLabel}
        </Text>
        <Text
          selectable
          style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21 }}
        >
          {message}
        </Text>
      </View>
    </Panel>
  );
};
