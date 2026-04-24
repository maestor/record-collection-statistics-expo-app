import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";

import type { RecordListItem } from "@/api/types";
import { translate } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCurrency, formatDate, formatYear } from "@/utils/format";

type RecordCardProps = {
  record: RecordListItem;
};

export function RecordCard({ record }: RecordCardProps) {
  return (
    <Link
      href={{ pathname: "/records/[releaseId]", params: { releaseId: String(record.releaseId) } }}
      asChild
    >
      <Pressable
        accessibilityLabel={translate("recordCard.accessibilityLabel", {
          artist: record.artistsSort ?? translate("common.unknownArtist"),
          title: record.title,
        })}
        accessibilityRole="link"
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.md,
          minHeight: 128,
          opacity: pressed ? 0.78 : 1,
          padding: spacing.md,
        })}
      >
        <Image
          accessibilityLabel={translate("recordCard.coverImage", { title: record.title })}
          contentFit="cover"
          source={record.thumb ? { uri: record.thumb } : null}
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.sm,
            height: 96,
            width: 96,
          }}
        />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: "800" }}>
            {record.title}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 15 }}>
            {record.artistsSort ?? translate("common.unknownArtist")}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 14 }}>
            {formatYear(record.releaseYear)} · {record.country ?? translate("common.unknownCountry")}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 14 }}>
            {`${translate("recordCard.lowestPrice", {
              price: formatCurrency(record.lowestPrice),
            })} · ${translate("recordCard.addedOn", {
              date: formatDate(record.latestDateAdded),
            })}`}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
