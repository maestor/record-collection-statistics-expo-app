import "react-native-gesture-handler";

import * as React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { translate } from "@/localization/i18n";
import { AppProviders } from "@/providers/app-providers";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.surfaceMuted },
            headerTintColor: colors.text,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="records/[releaseId]" options={{ title: translate("navigation.record") }} />
          <Stack.Screen name="breakdowns/[dimension]" options={{ title: translate("navigation.breakdown") }} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
