import * as React from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { getHealth, getErrorMessage } from "@/api/client";
import { Button } from "@/components/button";
import { FieldRow } from "@/components/field-row";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useAppSettings } from "@/providers/settings-provider";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function SettingsScreen() {
  const { isLoaded, resetSettings, saveSettings, settings } = useAppSettings();
  const queryClient = useQueryClient();
  const [apiBaseUrl, setApiBaseUrl] = React.useState(settings.baseUrl);
  const [apiKey, setApiKey] = React.useState(settings.apiKey);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setApiBaseUrl(settings.baseUrl);
    setApiKey(settings.apiKey);
  }, [settings]);

  async function save() {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await saveSettings({ apiKey, baseUrl: apiBaseUrl });
      await queryClient.invalidateQueries();
      setMessage("Settings saved.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function testConnection() {
    setIsTesting(true);
    setError(null);
    setMessage(null);

    try {
      const health = await getHealth({ apiKey, baseUrl: apiBaseUrl });
      setMessage(
        `Connected. Local cache has ${health.database.releaseCount} releases and ${health.database.totalItems} collection items.`,
      );
    } catch (connectionError) {
      setError(getErrorMessage(connectionError));
    } finally {
      setIsTesting(false);
    }
  }

  async function reset() {
    await resetSettings();
    await queryClient.invalidateQueries();
    setMessage("Settings reset.");
    setError(null);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      {!isLoaded ? (
        <StatusMessage
          message="Loading stored API connection settings."
          title="Loading settings"
          tone="loading"
        />
      ) : null}

      <Section title="API connection">
        <View style={{ gap: spacing.md }}>
          <FieldRow
            label="Android emulator URL"
            value="Use http://10.0.2.2:3003 when the API runs on your computer."
          />
          <FieldRow
            label="Physical Android URL"
            value="Use http://<computer-lan-ip>:3003 and configure an API key when the backend requires one."
          />
          <TextInput
            accessibilityLabel="API base URL"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="url"
            onChangeText={setApiBaseUrl}
            placeholder="http://127.0.0.1:3003"
            placeholderTextColor={colors.textMuted}
            style={inputStyle}
            value={apiBaseUrl}
          />
          <TextInput
            accessibilityLabel="API key"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setApiKey}
            placeholder="Optional API key"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={inputStyle}
            value={apiKey}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Button isLoading={isSaving} label="Save settings" onPress={save} style={{ flexGrow: 1 }} />
            <Button
              isLoading={isTesting}
              label="Test connection"
              onPress={testConnection}
              style={{ flexGrow: 1 }}
              variant="secondary"
            />
          </View>
          <Button label="Reset settings" onPress={reset} variant="danger" />
        </View>
      </Section>

      {message ? <StatusMessage message={message} title="Ready" /> : null}
      {error ? <StatusMessage message={error} title="Connection problem" tone="error" /> : null}
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: radius.md,
  borderWidth: 1,
  color: colors.text,
  fontSize: 16,
  minHeight: 52,
  paddingHorizontal: spacing.md,
};
