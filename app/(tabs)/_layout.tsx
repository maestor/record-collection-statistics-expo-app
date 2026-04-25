import * as React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceMuted,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? "view-dashboard" : "view-dashboard-outline"}
              size={size}
            />
          ),
          title: translate("navigation.dashboard"),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons color={color} name={focused ? "album" : "album"} size={size} />
          ),
          title: translate("navigation.records"),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons color={color} name={focused ? "information" : "information-outline"} size={size} />
          ),
          headerStyle: { backgroundColor: colors.surfaceMuted },
          headerTintColor: colors.text,
          title: translate("navigation.info"),
        }}
      />
    </Tabs>
  );
}
