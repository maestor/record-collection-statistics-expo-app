import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

import { useRecordDetailQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { FieldRow } from "@/components/field-row";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCount, formatCurrency, formatDate, formatYear, joinValues } from "@/utils/format";

type RecordDetailScreenProps = {
  releaseId: number;
};

export function RecordDetailScreen({ releaseId }: RecordDetailScreenProps) {
  const query = useRecordDetailQuery(releaseId);
  const record = query.data?.data;

  if (!Number.isFinite(releaseId)) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          message="The release id in this route is not valid."
          title="Invalid release"
          tone="error"
        />
      </ScrollView>
    );
  }

  if (query.isLoading) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          message="Loading the selected release from the local cache."
          title="Loading record"
          tone="loading"
        />
      </ScrollView>
    );
  }

  if (query.isError || !record) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StatusMessage
          actionLabel="Try again"
          message={getErrorMessage(query.error)}
          onAction={() => void query.refetch()}
          title="Record unavailable"
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
          accessibilityLabel={`Cover image for ${record.title}`}
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
            {record.artistsSort ?? "Unknown artist"}
          </Text>
        </View>
      </View>

      <Section title="Release">
        <View style={{ gap: spacing.lg }}>
          <FieldRow label="Year" value={formatYear(record.releaseYear)} />
          <FieldRow label="Released" value={record.released ?? "Unknown"} />
          <FieldRow label="Country" value={record.country ?? "Unknown"} />
          <FieldRow label="Formats" value={record.formats.map(formatReleaseFormat).join(", ")} />
          <FieldRow label="Genres" value={joinValues(record.genres)} />
          <FieldRow label="Styles" value={joinValues(record.styles)} />
          <FieldRow label="Lowest price" value={formatCurrency(record.lowestPrice)} />
        </View>
      </Section>

      <Section title="Collection">
        <View style={{ gap: spacing.lg }}>
          <FieldRow label="Instances" value={formatCount(record.instanceCount)} />
          <FieldRow label="First added" value={formatDate(record.firstDateAdded)} />
          <FieldRow label="Latest added" value={formatDate(record.latestDateAdded)} />
          <FieldRow label="Collection rating" value={formatCollectionRatings(record.collectionItems)} />
        </View>
      </Section>

      <Section title="Community">
        <View style={{ gap: spacing.lg }}>
          <FieldRow label="Have" value={formatCount(record.community.have)} />
          <FieldRow label="Want" value={formatCount(record.community.want)} />
          <FieldRow label="Rating" value={formatCommunityRating(record.community)} />
          <FieldRow label="For sale" value={formatCount(record.numForSale)} />
        </View>
      </Section>

      <Section title="Labels">
        <View style={{ gap: spacing.md }}>
          {record.labels.map((label) => (
            <FieldRow
              key={`${label.position}-${label.name}-${label.catno ?? ""}`}
              label={label.name}
              value={label.catno ?? "No catalog number"}
            />
          ))}
        </View>
      </Section>

      <Section title="Track list">
        <View style={{ gap: spacing.md }}>
          {record.tracks.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              No tracks available.
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

      <Section title="Identifiers">
        <View style={{ gap: spacing.md }}>
          {record.identifiers.length === 0 ? (
            <Text selectable style={{ color: colors.textMuted }}>
              No identifiers available.
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
    return "Not rated";
  }

  return ratedItems.map((item) => `${item.rating}/5`).join(", ");
}

function formatCommunityRating(community: {
  ratingAverage: number | null;
  ratingCount: number | null;
}) {
  if (community.ratingAverage === null) {
    return "Unknown";
  }

  return `${community.ratingAverage.toFixed(2)} from ${formatCount(community.ratingCount)} ratings`;
}
