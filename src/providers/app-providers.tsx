import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LocalizationProvider } from "@/localization/i18n";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export const DEFAULT_QUERY_STALE_TIME = 30 * MINUTE_MS;
export const QUERY_CACHE_MAX_AGE = 24 * HOUR_MS;
export const QUERY_CACHE_BUSTER = "query-cache-v1";

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: QUERY_CACHE_MAX_AGE,
        refetchOnReconnect: true,
        retry: 1,
        staleTime: DEFAULT_QUERY_STALE_TIME,
      },
    },
  });

export const appQueryClient = createQueryClient();

export const AppProviders = ({
  children,
  client,
  persistQueryClient = true,
}: React.PropsWithChildren<{
  client: QueryClient;
  persistQueryClient?: boolean;
}>) => {
  const queryProvider = persistQueryClient ? (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        buster: QUERY_CACHE_BUSTER,
        maxAge: QUERY_CACHE_MAX_AGE,
        persister: queryPersister,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        {queryProvider}
      </LocalizationProvider>
    </SafeAreaProvider>
  );
};
