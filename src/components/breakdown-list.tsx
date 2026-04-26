import * as React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

import { translate } from "@/localization/i18n";
import { Section } from "./section";
import type { BreakdownDimension, BreakdownItem } from "@/api/types";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { surfaceCardStyle } from "@/theme/styles";
import { formatCount } from "@/utils/format";

type BreakdownListProps = {
  dimension?: BreakdownDimension;
  items: readonly BreakdownItem[];
  title: string;
  withSection?: boolean;
};

export const BreakdownList = ({
  dimension,
  items,
  title,
  withSection = true,
}: BreakdownListProps) => {
  const max = Math.max(...items.map((item) => item.releaseCount), 1);
  const content = (
    <>
      {dimension && (
        <Link
          accessibilityRole="link"
          href={{
            pathname: "/statistics/breakdowns/[dimension]",
            params: { dimension },
          }}
          style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}
        >
          {`${translate("breakdowns.viewFullPrefix")}`}
        </Link>
      )}
      <View style={{ gap: spacing.sm }}>
        {items.length === 0 ? (
          <Text selectable style={{ color: colors.textMuted }}>
            {translate("common.noValuesYet")}
          </Text>
        ) : (
          items.map((item) => (
            <BreakdownRow
              count={item.releaseCount}
              key={item.value}
              label={item.value}
              max={max}
            />
          ))
        )}
      </View>
    </>
  );

  if (!withSection) {
    return <View style={{ gap: spacing.md }}>{content}</View>;
  }

  return <Section title={title}>{content}</Section>;
};

type BreakdownRowProps = {
  count: number;
  label: string;
  max: number;
};

export const BreakdownRow = ({ count, label, max }: BreakdownRowProps) => {
  const width = `${Math.max((count / max) * 100, 4)}%` as `${number}%`;

  return (
    <View
      accessibilityLabel={`${label}, ${formatCount(count)} releases`}
      style={[surfaceCardStyle, { gap: spacing.sm, padding: spacing.md }]}
    >
      <View
        style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}
      >
        <Text
          selectable
          style={{
            color: colors.text,
            flex: 1,
            fontSize: 15,
            fontWeight: "700",
          }}
        >
          {label}
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 14,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatCount(count)}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.primaryDark,
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
};
