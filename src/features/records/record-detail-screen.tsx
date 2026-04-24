import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

import { useRecordDetailQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { FieldRow } from "@/components/field-row";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatDate, joinValues } from "@/utils/format";

type RecordDetailScreenProps = {
  releaseId: number;
};

export function RecordDetailScreen({ releaseId }: RecordDetailScreenProps) {
  const { t } = useTranslation();
  const query = useRecordDetailQuery(releaseId);

  if (!Number.isFinite(releaseId)) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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

  const record = query.data!.data;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      <View style={{ gap: spacing.lg }}>
        <Image
          accessibilityLabel={t("recordDetail.coverImage", { title: record.title })}
          contentFit="cover"
          source={record.coverImage ? { uri: record.coverImage } : null}
          style={{
            aspectRatio: 1,
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.md,
            width: "100%",
          }}
        />
        <View style={{ gap: spacing.sm }}>
          <Text selectable style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>
            {record.title}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 18, lineHeight: 25 }}>
            {record.artistsSort ?? t("common.unknownArtist")}
          </Text>
        </View>
      </View>

      <Section title={t("recordDetail.release")}>
        <View style={{ gap: spacing.lg }}>
          <FieldRow label={t("recordDetail.releaseReleased")} value={formatDate(record.released)} />
          <FieldRow label={t("recordDetail.releaseCountry")} value={record.country ?? t("common.unknown")} />
          <FieldRow label={t("recordDetail.releaseFormats")} value={record.formats.map(formatReleaseFormat).join("\n")} />
          <FieldRow label={t("recordDetail.releaseGenres")} value={joinValues(record.genres)} />
          <FieldRow label={t("recordDetail.releaseStyles")} value={joinValues(record.styles)} />
        </View>
      </Section>

      <Section title={t("recordDetail.collection")}>
        <View style={{ gap: spacing.lg }}>
          <FieldRow label={t("recordDetail.collectionAddedOn")} value={formatDate(record.dateAdded)} />
        </View>
      </Section>

      <Section title={t("recordDetail.labels")}>
        <View style={{ gap: spacing.md }}>
          {groupLabels(record.labels, t("recordDetail.noCatalogNumber")).map(([name, values], index) => (
            <FieldRow
              key={`${name}-${index}`}
              label={name}
              value={values.join("\n")}
            />
          ))}
        </View>
      </Section>

      <Section title={t("recordDetail.trackList")}>
        <View style={{ gap: spacing.md }}>
          {record.tracks.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              {t("recordDetail.tracksEmpty")}
            </Text>
          ) : (
            record.tracks.map((track, index) => (
              <FieldRow
                key={`${track.position ?? index}-${track.title}`}
                label={track.position ?? String(index + 1)}
                value={track.duration ? `${track.title} (${track.duration})` : track.title}
              />
            ))
          )}
        </View>
      </Section>

      <Section title={t("recordDetail.identifiers")}>
        <View style={{ gap: spacing.md }}>
          {record.identifiers.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              {t("recordDetail.identifiersEmpty")}
            </Text>
          ) : (
            groupIdentifiers(record.identifiers).map(([type, values], index) => (
              <FieldRow
                key={`${type}-${index}`}
                label={type}
                value={values.join("\n")}
              />
            ))
          )}
        </View>
      </Section>
    </ScrollView>
  );
}

function formatReleaseFormat(format: { descriptions: string[]; freeText: string | null; name: string }) {
  return [format.name, ...format.descriptions, format.freeText].filter(Boolean).join(", ");
}

function formatIdentifierValue(identifier: { description: string | null; value: string }) {
  return identifier.description ? `${identifier.value} · ${identifier.description}` : identifier.value;
}

function groupIdentifiers(
  identifiers: {
    description: string | null;
    type: string;
    value: string;
  }[],
) {
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
}

function groupLabels(
  labels: {
    catno: string | null;
    name: string;
  }[],
  emptyValue: string,
) {
  const grouped = new Map<string, string[]>();

  for (const label of labels) {
    const values = grouped.get(label.name);
    const formattedValue = label.catno ?? emptyValue;

    if (values) {
      values.push(formattedValue);
    } else {
      grouped.set(label.name, [formattedValue]);
    }
  }

  return Array.from(grouped.entries());
}
