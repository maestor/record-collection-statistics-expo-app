import * as React from "react";
import { Stack } from "expo-router";

import { translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";

const RecordsStackLayout = () => {
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
        options={{ title: translate("navigation.records") }}
      />
      <Stack.Screen
        name="[releaseId]"
        options={{ title: translate("navigation.record") }}
      />
    </Stack>
  );
};

export default RecordsStackLayout;
