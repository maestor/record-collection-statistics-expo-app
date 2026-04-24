import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
