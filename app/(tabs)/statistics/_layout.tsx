import * as React from "react";
import { Stack } from "expo-router";

import { translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";

const StatisticsStackLayout = () => {
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
        options={{ title: translate("navigation.statistics") }}
      />
      <Stack.Screen
        name="breakdowns/[dimension]"
        options={{ title: translate("navigation.breakdown") }}
      />
    </Stack>
  );
};

export default StatisticsStackLayout;
