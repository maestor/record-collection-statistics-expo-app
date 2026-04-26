import * as React from "react";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react-native";

import { translate } from "@/localization/i18n";
import { AppProviders } from "@/providers/app-providers";

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  return render(
    <AppProviders client={queryClient} persistQueryClient={false}>
      {ui}
    </AppProviders>,
  );
};

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
): Response => {
  return {
    headers: new Headers(headers),
    json: jest.fn(async () => body),
    ok: status >= 200 && status < 300,
    status,
  } as unknown as Response;
};

type TestElement = Parameters<typeof fireEvent>[0];

const responderEvent = () => {
  return {
    nativeEvent: {
      timestamp: Date.now(),
    },
    persist: jest.fn(),
  };
};

export const startPressablePressedState = (element: TestElement) => {
  // RNTL does not toggle Pressable's pressed style state through press events.
  // Use this only for user-visible Pressable pressed-style assertions.
  fireEvent(element, "onResponderGrant", responderEvent());
};

export const endPressablePressedState = (element: TestElement) => {
  fireEvent(element, "onResponderTerminate", responderEvent());
};

export const t = translate;
