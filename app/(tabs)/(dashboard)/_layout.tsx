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
        name="highlights"
        options={{ title: translate("navigation.highlights") }}
      />
      <Stack.Screen
        name="breakdowns/[dimension]"
        options={{ title: translate("navigation.breakdown") }}
      />
    </Stack>
  );
};

export default DashboardStackLayout;
