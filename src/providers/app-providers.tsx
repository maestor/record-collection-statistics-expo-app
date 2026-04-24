import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppSettingsProvider } from "./settings-provider";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 2,
      },
    },
  });
}

const queryClient = createQueryClient();

export function AppProviders({ children }: React.PropsWithChildren) {
  return (
    <AppSettingsProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppSettingsProvider>
  );
}

