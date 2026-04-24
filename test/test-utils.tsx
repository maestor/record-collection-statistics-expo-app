import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    json: jest.fn(async () => body),
    ok: status >= 200 && status < 300,
    status,
  } as unknown as Response;
}
