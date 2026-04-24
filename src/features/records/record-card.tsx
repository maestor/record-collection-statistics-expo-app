import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import type { RecordListItem } from "@/api/types";
import { translate } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatDate, formatYear } from "@/utils/format";

type RecordCardProps = {
  record: RecordListItem;
};

export function RecordCard({ record }: RecordCardProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel={translate("recordCard.accessibilityLabel", {
        artist: record.artistsSort ?? translate("common.unknownArtist"),
        title: record.title,
      })}
      accessibilityRole="link"
      onPress={() =>
        router.push({
          params: { releaseId: String(record.releaseId) },
          pathname: "/records/[releaseId]",
        })
      }
      style={({ pressed }) => ({
        backgroundColor: colors.primaryDark,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        minHeight: 98,
        opacity: pressed ? 0.84 : 1,
        padding: spacing.sm,
        width: "100%",
      })}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, width: "100%" }}>
        <Image
          accessibilityLabel={translate("recordCard.coverImage", { title: record.title })}
          contentFit="cover"
          source={record.thumb ? { uri: record.thumb } : null}
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.sm,
            flexShrink: 0,
            height: 78,
            width: 78,
          }}
        />
        <View style={{ flex: 1, gap: 2, justifyContent: "flex-start", minWidth: 0 }}>
          <Text
            numberOfLines={2}
            selectable
            style={{ color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 20 }}
          >
            {record.title}
          </Text>
          <Text numberOfLines={1} selectable style={{ color: colors.textMuted, fontSize: 14 }}>
            {record.artistsSort ?? translate("common.unknownArtist")}
          </Text>
          {record.formats.map((format, index) => (
            <Text
              key={`${format.name}-${format.freeText ?? ""}-${index}`}
              numberOfLines={3}
              selectable
              style={{ color: colors.textMuted, fontSize: 13, lineHeight: 16 }}
            >
              {formatReleaseFormat(format)}
            </Text>
          ))}
          <Text numberOfLines={1} selectable style={{ color: colors.textMuted, fontSize: 13 }}>
            {formatYear(record.releaseYear)} · {record.country ?? translate("common.unknownCountry")}
          </Text>
          <Text numberOfLines={1} selectable style={{ color: colors.textMuted, fontSize: 13 }}>
            {translate("recordCard.addedOn", {
              date: formatDate(record.dateAdded),
            })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function formatReleaseFormat(format: RecordListItem["formats"][number]) {
  return [format.name, ...format.descriptions, format.freeText].filter(Boolean).join(", ");
}
