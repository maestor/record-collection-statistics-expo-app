import * as React from "react";
import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";

import { translate } from "@/localization/i18n";
import { AppProviders } from "@/providers/app-providers";

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  return render(<AppProviders client={queryClient}>{ui}</AppProviders>);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    json: jest.fn(async () => body),
    ok: status >= 200 && status < 300,
    status,
  } as unknown as Response;
}

export const t = translate;
