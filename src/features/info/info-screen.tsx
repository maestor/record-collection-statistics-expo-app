import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, ScrollView, Text, View } from "react-native";

import { Chip } from "@/components/chip";
import { CollectionStatusCard } from "@/components/collection-status-card";
import { Section } from "@/components/section";
import { useTranslation } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { screenStyles, wrapRowStyle } from "@/theme/styles";

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

export const InfoScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <CollectionStatusCard />

      <Section title={t("info.externalLinksTitle")}>
        <View style={wrapRowStyle}>
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
};

const ExternalLinkChip = ({
  icon,
  label,
  url,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  url: string;
}) => {
  const { t } = useTranslation();

  return (
    <Chip
      accessibilityLabel={t("info.openExternalLink", { label })}
      accessibilityRole="link"
      label={label}
      leadingAccessory={
        <MaterialCommunityIcons color={colors.text} name={icon} size={20} />
      }
      onPress={() => void Linking.openURL(url)}
      pressedBackgroundColor={colors.primary}
      style={{ minHeight: 48 }}
      textStyle={{ fontSize: 15 }}
    />
  );
};
