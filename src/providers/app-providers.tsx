import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LocalizationProvider } from "@/localization/i18n";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 2,
      },
    },
  });

export const appQueryClient = createQueryClient();

export const AppProviders = ({
  children,
  client,
}: React.PropsWithChildren<{ client: QueryClient }>) => {
  return (
    <LocalizationProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </LocalizationProvider>
  );
};
