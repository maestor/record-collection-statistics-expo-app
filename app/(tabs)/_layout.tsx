import * as React from "react";
import { Tabs } from "expo-router";

import { translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: translate("navigation.dashboard") }} />
      <Tabs.Screen name="records" options={{ title: translate("navigation.records") }} />
    </Tabs>
  );
}
