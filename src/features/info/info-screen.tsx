import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { CollectionStatusCard } from "@/components/collection-status-card";
import { Section } from "@/components/section";
import { useTranslation } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const externalLinks = [
  {
    icon: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/khaavisto/",
  },
  {
    icon: "github",
    label: "App",
    url: "https://github.com/maestor/record-collection-statistics-expo-app",
  },
  {
    icon: "github",
    label: "API",
    url: "https://github.com/maestor/record-collection-statistics-api",
  },
] as const;

export function InfoScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      <CollectionStatusCard />

      <Section title={t("info.externalLinksTitle")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {externalLinks.map((link) => (
            <ExternalLinkChip
              icon={link.icon}
              key={link.url}
              label={link.label}
              url={link.url}
            />
          ))}
        </View>
      </Section>

      <Text
        selectable
        style={{
          color: colors.textMuted,
          fontSize: 14,
          lineHeight: 20,
          paddingBottom: spacing.lg,
          textAlign: "center",
        }}
      >
        {t("info.copyright")}
      </Text>
    </ScrollView>
  );
}

function ExternalLinkChip({
  icon,
  label,
  url,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  url: string;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={t("info.openExternalLink", { label })}
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed ? colors.primary : colors.surfaceMuted,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 48,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      })}
    >
      <MaterialCommunityIcons color={colors.text} name={icon} size={20} />
      <Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
