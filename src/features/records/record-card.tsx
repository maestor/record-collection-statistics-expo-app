import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";

import type { RecordListItem } from "@/api/types";
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
        accessibilityLabel={`${record.title} by ${record.artistsSort ?? "unknown artist"}`}
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
          accessibilityLabel={`Cover thumbnail for ${record.title}`}
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
            {record.artistsSort ?? "Unknown artist"}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 14 }}>
            {formatYear(record.releaseYear)} · {record.country ?? "Unknown country"}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 14 }}>
            Lowest {formatCurrency(record.lowestPrice)} · Added {formatDate(record.latestDateAdded)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
