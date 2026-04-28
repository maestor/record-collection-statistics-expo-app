import * as React from "react";
import { Stack } from "expo-router";

import { translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";

const DashboardStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surfaceMuted },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: translate("navigation.dashboard") }}
      />
      <Stack.Screen
        name="random-record"
        options={{ title: translate("navigation.randomRecord") }}
      />
    </Stack>
  );
};

export default DashboardStackLayout;
