import "react-native-gesture-handler";

import * as React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers/app-providers";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="records/[releaseId]" options={{ title: "Record" }} />
          <Stack.Screen name="breakdowns/[dimension]" options={{ title: "Breakdown" }} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

