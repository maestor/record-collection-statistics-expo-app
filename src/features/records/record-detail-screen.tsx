import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

import { useRecordDetailQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { FieldRow } from "@/components/field-row";
import { Panel } from "@/components/panel";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { screenStyles } from "@/theme/styles";
import { formatDate, joinValues } from "@/utils/format";
import {
  formatLabels,
  formatReleaseFormat,
  formatTrack,
  groupIdentifiers,
} from "./records-helpers";

type RecordDetailScreenProps = {
  releaseId: number;
};

export const RecordDetailScreen = ({ releaseId }: RecordDetailScreenProps) => {
  const { t } = useTranslation();
  const query = useRecordDetailQuery(releaseId);

  if (!Number.isFinite(releaseId)) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
        <StatusMessage
          message={t("recordDetail.invalidMessage")}
          title={t("recordDetail.invalidTitle")}
          tone="error"
        />
      </ScrollView>
    );
  }

  if (query.isLoading) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
        <StatusMessage
          message={t("recordDetail.loadingMessage")}
          title={t("recordDetail.loadingTitle")}
          tone="loading"
        />
      </ScrollView>
    );
  }

  if (query.isError) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(query.error)}
          onAction={() => void query.refetch()}
          title={t("recordDetail.errorTitle")}
          tone="error"
        />
      </ScrollView>
    );
  }

  if (!query.data) {
    return (
      <ScrollView contentContainerStyle={screenStyles.paddedContent}>
        <StatusMessage
          message={t("recordDetail.loadingMessage")}
          title={t("recordDetail.loadingTitle")}
          tone="loading"
        />
      </ScrollView>
    );
  }

  const record = query.data.data;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <View style={{ gap: spacing.lg }}>
        <Panel
          backgroundColor={colors.surface}
          borderColor={colors.border}
          style={{ gap: spacing.lg, padding: spacing.lg }}
        >
          <View style={{ gap: spacing.sm }}>
            <Text
              selectable
              style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}
            >
              {record.title}
            </Text>
            <Text
              selectable
              style={{ color: colors.textMuted, fontSize: 20, lineHeight: 20 }}
            >
              {record.artistsSort ?? t("common.unknownArtist")}
            </Text>
          </View>
          <Image
            accessibilityLabel={t("recordDetail.coverImage", {
              title: record.title,
            })}
            contentFit="cover"
            source={record.coverImage ? { uri: record.coverImage } : null}
            style={{
              aspectRatio: 1,
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.md,
              width: "100%",
            }}
          />
        </Panel>
      </View>

      <Section title={t("recordDetail.release")}>
        <Panel
          backgroundColor={colors.surface}
          borderColor={colors.border}
          style={{ gap: spacing.lg, padding: spacing.lg }}
        >
          <FieldRow
            label={t("recordDetail.releaseReleased")}
            value={formatDate(record.released)}
          />
          <FieldRow
            label={t("recordDetail.releaseCountry")}
            value={record.country ?? t("common.unknown")}
          />
          <FieldRow
            label={t("recordDetail.labels")}
            value={formatLabels(
              record.labels,
              t("recordDetail.noCatalogNumber"),
              t("common.unknown"),
            )}
          />
          <FieldRow
            label={t("recordDetail.releaseFormats")}
            value={record.formats.map(formatReleaseFormat).join("\n")}
          />
          <FieldRow
            label={t("recordDetail.releaseGenres")}
            value={joinValues(record.genres)}
          />
          <FieldRow
            label={t("recordDetail.releaseStyles")}
            value={joinValues(record.styles)}
          />
          <FieldRow
            label={t("recordDetail.collectionAddedOn")}
            value={formatDate(record.dateAdded)}
          />
        </Panel>
      </Section>

      {record.tracks.length > 0 && (
        <Section title={t("recordDetail.trackList")}>
          <Panel
            backgroundColor={colors.surface}
            borderColor={colors.border}
            style={{ gap: spacing.sm, padding: spacing.lg }}
          >
            {record.tracks.map((track, index) => (
              <Text
                key={`${track.position ?? index}-${track.title}`}
                selectable
                style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}
              >
                {formatTrack(track, index)}
              </Text>
            ))}
          </Panel>
        </Section>
      )}

      {record.identifiers.length > 0 && (
        <Section title={t("recordDetail.identifiers")}>
          <Panel
            backgroundColor={colors.surface}
            borderColor={colors.border}
            style={{ gap: spacing.sm, padding: spacing.lg }}
          >
            {groupIdentifiers(record.identifiers).map(([type, values], index) => (
              <FieldRow
                key={`${type}-${index}`}
                label={type}
                value={values.join("\n")}
              />
            ))}
          </Panel>
        </Section>
      )}
    </ScrollView>
  );
};
