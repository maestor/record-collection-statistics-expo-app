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

      <Section title={t("recordDetail.trackList")}>
        <Panel
          backgroundColor={colors.surface}
          borderColor={colors.border}
          style={{ gap: spacing.sm, padding: spacing.lg }}
        >
          {record.tracks.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              {t("recordDetail.tracksEmpty")}
            </Text>
          ) : (
            record.tracks.map((track, index) => (
              <Text
                key={`${track.position ?? index}-${track.title}`}
                selectable
                style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}
              >
                {formatTrack(track, index)}
              </Text>
            ))
          )}
        </Panel>
      </Section>

      <Section title={t("recordDetail.identifiers")}>
        <Panel
          backgroundColor={colors.surface}
          borderColor={colors.border}
          style={{ gap: spacing.sm, padding: spacing.lg }}
        >
          {record.identifiers.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              {t("recordDetail.identifiersEmpty")}
            </Text>
          ) : (
            groupIdentifiers(record.identifiers).map(
              ([type, values], index) => (
                <FieldRow
                  key={`${type}-${index}`}
                  label={type}
                  value={values.join("\n")}
                />
              ),
            )
          )}
        </Panel>
      </Section>
    </ScrollView>
  );
};

const formatReleaseFormat = (format: {
  descriptions: string[];
  freeText: string | null;
  name: string;
}) =>
  [format.name, ...format.descriptions, format.freeText]
    .filter(Boolean)
    .join(", ");

const formatIdentifierValue = (identifier: {
  description: string | null;
  value: string;
}) =>
  identifier.description
    ? `${identifier.value} · ${identifier.description}`
    : identifier.value;

const formatLabels = (
  labels: {
    catno: string | null;
    name: string;
  }[],
  emptyValue: string,
  unknownValue: string,
) =>
  labels.length === 0
    ? unknownValue
    : labels.map((label) => formatLabelValue(label, emptyValue)).join("\n");

const formatLabelValue = (
  label: {
    catno: string | null;
    name: string;
  },
  emptyValue: string,
) => `${label.name} · ${label.catno ?? emptyValue}`;

const formatTrack = (
  track: {
    duration: string | null;
    position: string | null;
    title: string;
  },
  index: number,
) => {
  const parts = [track.position ?? String(index + 1), track.title];

  if (track.duration) {
    parts.push(track.duration);
  }

  return parts.join(" • ");
};

const groupIdentifiers = (
  identifiers: {
    description: string | null;
    type: string;
    value: string;
  }[],
) => {
  const grouped = new Map<string, string[]>();

  for (const identifier of identifiers) {
    const values = grouped.get(identifier.type);
    const formattedValue = formatIdentifierValue(identifier);

    if (values) {
      values.push(formattedValue);
    } else {
      grouped.set(identifier.type, [formattedValue]);
    }
  }

  return Array.from(grouped.entries());
};
