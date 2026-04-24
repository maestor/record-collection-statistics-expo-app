import * as React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

import { translate } from "@/localization/i18n";
import { Section } from "./section";
import type { BreakdownDimension, BreakdownItem } from "@/api/types";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCount } from "@/utils/format";

type BreakdownListProps = {
  dimension?: BreakdownDimension;
  items: readonly BreakdownItem[];
  title: string;
};

export function BreakdownList({ dimension, items, title }: BreakdownListProps) {
  const max = Math.max(...items.map((item) => item.releaseCount), 1);

  return (
    <Section title={title}>
      <View style={{ gap: spacing.sm }}>
        {items.length === 0 ? (
          <Text selectable style={{ color: colors.textMuted }}>
            {translate("common.noValuesYet")}
          </Text>
        ) : (
          items.map((item) => <BreakdownRow item={item} key={item.value} max={max} />)
        )}
      </View>
      {dimension ? (
        <Link
          accessibilityRole="link"
          href={{ pathname: "/breakdowns/[dimension]", params: { dimension } }}
          style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}
        >
          {`${translate("breakdowns.viewFullPrefix")} ${title.toLowerCase()}`}
        </Link>
      ) : null}
    </Section>
  );
}

function BreakdownRow({ item, max }: { item: BreakdownItem; max: number }) {
  const width = `${Math.max((item.releaseCount / max) * 100, 4)}%` as `${number}%`;

  return (
    <View
      accessibilityLabel={`${item.value}, ${formatCount(item.releaseCount)} releases`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
        padding: spacing.md,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <Text
          selectable
          style={{ color: colors.text, flex: 1, fontSize: 15, fontWeight: "700" }}
        >
          {item.value}
        </Text>
        <Text
          selectable
          style={{ color: colors.textMuted, fontSize: 14, fontVariant: ["tabular-nums"] }}
        >
          {formatCount(item.releaseCount)}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.primarySoft,
          borderCurve: "continuous",
          borderRadius: radius.sm,
          height: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: colors.primary,
            height: "100%",
            width,
          }}
        />
      </View>
    </View>
  );
}
