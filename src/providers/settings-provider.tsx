import * as React from "react";
import * as SecureStore from "expo-secure-store";

import { DEFAULT_API_BASE_URL, getDeviceReachableBaseUrl, normalizeBaseUrl, type ApiConfig } from "@/api/client";

const API_BASE_URL_KEY = "recordCollection.apiBaseUrl";
const API_KEY_KEY = "recordCollection.apiKey";

type AppSettings = ApiConfig;

type AppSettingsContextValue = {
  isLoaded: boolean;
  revision: number;
  saveSettings: (settings: AppSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  settings: AppSettings;
};

const defaultSettings: AppSettings = {
  apiKey: "",
  baseUrl: DEFAULT_API_BASE_URL,
};

const AppSettingsContext = React.createContext<AppSettingsContextValue | null>(null);
const fallbackStore = new Map<string, string>();

async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function getStoredValue(key: string): Promise<string | null> {
  if (await isSecureStoreAvailable()) {
    return SecureStore.getItemAsync(key);
  }

  return fallbackStore.get(key) ?? null;
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  fallbackStore.set(key, value);
}

async function deleteStoredValue(key: string): Promise<void> {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  fallbackStore.delete(key);
}

export function AppSettingsProvider({ children }: React.PropsWithChildren) {
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [revision, setRevision] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const [baseUrl, apiKey] = await Promise.all([
        getStoredValue(API_BASE_URL_KEY),
        getStoredValue(API_KEY_KEY),
      ]);

      if (isMounted) {
        setSettings({
          apiKey: apiKey ?? "",
          baseUrl: getDeviceReachableBaseUrl(baseUrl),
        });
        setIsLoaded(true);
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = React.useCallback(async (nextSettings: AppSettings) => {
    const normalizedSettings = {
      apiKey: nextSettings.apiKey.trim(),
      baseUrl: normalizeBaseUrl(nextSettings.baseUrl),
    };

    await Promise.all([
      setStoredValue(API_BASE_URL_KEY, normalizedSettings.baseUrl),
      normalizedSettings.apiKey
        ? setStoredValue(API_KEY_KEY, normalizedSettings.apiKey)
        : deleteStoredValue(API_KEY_KEY),
    ]);

    setSettings(normalizedSettings);
    setRevision((value) => value + 1);
  }, []);

  const resetSettings = React.useCallback(async () => {
    await Promise.all([deleteStoredValue(API_BASE_URL_KEY), deleteStoredValue(API_KEY_KEY)]);
    setSettings(defaultSettings);
    setRevision((value) => value + 1);
  }, []);

  const value = React.useMemo<AppSettingsContextValue>(
    () => ({ isLoaded, resetSettings, revision, saveSettings, settings }),
    [isLoaded, resetSettings, revision, saveSettings, settings],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const value = React.use(AppSettingsContext);

  if (!value) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }

  return value;
}
