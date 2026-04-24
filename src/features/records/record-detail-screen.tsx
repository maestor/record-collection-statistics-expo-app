import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

import { useRecordDetailQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { FieldRow } from "@/components/field-row";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation, translate } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCount, formatDate, formatYear, joinValues } from "@/utils/format";

type RecordDetailScreenProps = {
  releaseId: number;
};

export function RecordDetailScreen({ releaseId }: RecordDetailScreenProps) {
  const { t } = useTranslation();
  const query = useRecordDetailQuery(releaseId);
  const record = query.data?.data;

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

  if (query.isError || !record) {
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
          <FieldRow label={t("recordDetail.releaseYear")} value={formatYear(record.releaseYear)} />
          <FieldRow label={t("recordDetail.releaseReleased")} value={record.released ?? t("common.unknown")} />
          <FieldRow label={t("recordDetail.releaseCountry")} value={record.country ?? t("common.unknown")} />
          <FieldRow
            label={t("recordDetail.releaseFormats")}
            value={record.formats.map(formatReleaseFormat).join(", ")}
          />
          <FieldRow label={t("recordDetail.releaseGenres")} value={joinValues(record.genres)} />
          <FieldRow label={t("recordDetail.releaseStyles")} value={joinValues(record.styles)} />
        </View>
      </Section>

      <Section title={t("recordDetail.collection")}>
        <View style={{ gap: spacing.lg }}>
          <FieldRow label={t("recordDetail.collectionInstances")} value={formatCount(record.instanceCount)} />
          <FieldRow label={t("recordDetail.collectionFirstAdded")} value={formatDate(record.firstDateAdded)} />
          <FieldRow label={t("recordDetail.collectionLatestAdded")} value={formatDate(record.latestDateAdded)} />
          <FieldRow
            label={t("recordDetail.collectionRating")}
            value={formatCollectionRatings(record.collectionItems)}
          />
        </View>
      </Section>

      <Section title={t("recordDetail.community")}>
        <View style={{ gap: spacing.lg }}>
          <FieldRow label={t("recordDetail.communityHave")} value={formatCount(record.community.have)} />
          <FieldRow label={t("recordDetail.communityWant")} value={formatCount(record.community.want)} />
          <FieldRow label={t("recordDetail.communityRating")} value={formatCommunityRating(record.community)} />
          <FieldRow label={t("recordDetail.communityForSale")} value={formatCount(record.numForSale)} />
        </View>
      </Section>

      <Section title={t("recordDetail.labels")}>
        <View style={{ gap: spacing.md }}>
          {record.labels.map((label) => (
            <FieldRow
              key={`${label.position}-${label.name}-${label.catno ?? ""}`}
              label={label.name}
              value={label.catno ?? t("recordDetail.noCatalogNumber")}
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
            record.identifiers.map((identifier) => (
              <FieldRow
                key={`${identifier.type}-${identifier.value}`}
                label={identifier.type}
                value={identifier.description ? `${identifier.value} · ${identifier.description}` : identifier.value}
              />
            ))
          )}
        </View>
      </Section>
    </ScrollView>
  );
}

function formatReleaseFormat(format: { descriptions: string[]; name: string; qty: string | null }) {
  const details = [format.qty, ...format.descriptions].filter(Boolean).join(" ");
  return details ? `${details} ${format.name}` : format.name;
}

function formatCollectionRatings(items: { rating: number }[]) {
  const ratedItems = items.filter((item) => item.rating > 0);

  if (ratedItems.length === 0) {
    return translate("common.notRated");
  }

  return ratedItems.map((item) => `${item.rating}/5`).join(", ");
}

function formatCommunityRating(community: {
  ratingAverage: number | null;
  ratingCount: number | null;
}) {
  if (community.ratingAverage === null) {
    return translate("common.unknown");
  }

  return translate("recordDetail.communityRatingValue", {
    average: community.ratingAverage.toFixed(2),
    count: formatCount(community.ratingCount),
  });
}
