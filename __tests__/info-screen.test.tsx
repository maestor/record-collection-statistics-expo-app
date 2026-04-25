import * as React from "react";
import { Linking } from "react-native";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { InfoScreen } from "@/features/info/info-screen";
import { colors } from "@/theme/colors";
import {
  endPressablePressedState,
  jsonResponse,
  renderWithProviders,
  startPressablePressedState,
  t,
} from "../test/test-utils";

describe("InfoScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        database: {
          lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
          releaseCount: 2,
          totalItems: 2,
        },
        ok: true,
      }),
    );
  });

  it("renders a loading state while sync info is still loading", async () => {
    let resolveHealthResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveHealthResponse = resolve;
        }),
    );

    renderWithProviders(<InfoScreen />);

    expect(screen.getByText(t("dashboard.syncStatusLoading"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.healthStatusUnavailable"))).toBeTruthy();

    resolveHealthResponse?.(
      jsonResponse({
        database: {
          lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
          releaseCount: 2,
          totalItems: 2,
        },
        ok: true,
      }),
    );

    expect(await screen.findByText(t("dashboard.healthStatusHealthy"))).toBeTruthy();
  });

  it("renders sync info and opens external links", async () => {
    const openUrlSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    renderWithProviders(<InfoScreen />);

    expect(await screen.findByText(t("dashboard.healthStatusHealthy"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.syncStatusTitle"))).toBeTruthy();
    expect(screen.getByText(t("info.copyright"))).toBeTruthy();

    const linkedInLink = screen.getByRole("link", { name: t("info.openExternalLink", { label: "LinkedIn" }) });
    startPressablePressedState(linkedInLink);
    expect(linkedInLink).toHaveStyle({ backgroundColor: colors.primary });
    endPressablePressedState(linkedInLink);
    await waitFor(() => {
      expect(linkedInLink).toHaveStyle({ backgroundColor: colors.surfaceMuted });
    });
    fireEvent.press(linkedInLink);
    fireEvent.press(screen.getByRole("link", { name: t("info.openExternalLink", { label: "App" }) }));
    fireEvent.press(screen.getByRole("link", { name: t("info.openExternalLink", { label: "API" }) }));

    expect(openUrlSpy).toHaveBeenNthCalledWith(1, "https://www.linkedin.com/in/khaavisto/");
    expect(openUrlSpy).toHaveBeenNthCalledWith(2, "https://github.com/maestor/record-collection-statistics-expo-app");
    expect(openUrlSpy).toHaveBeenNthCalledWith(3, "https://github.com/maestor/record-collection-statistics-api");

    openUrlSpy.mockRestore();
  });

  it("renders unavailable sync info when no successful sync is known", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        database: {
          lastSuccessfulSyncAt: null,
          releaseCount: 0,
          totalItems: 0,
        },
        ok: false,
      }),
    );

    renderWithProviders(<InfoScreen />);

    expect(await screen.findByText(t("dashboard.healthStatusUnavailable"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.syncUnavailableMessage"))).toBeTruthy();
  });

  it("renders sync fetch errors", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Sync failed" }, 503));

    renderWithProviders(<InfoScreen />);

    expect(await screen.findByText("Sync failed")).toBeTruthy();
    expect(screen.getByText(t("dashboard.healthStatusUnavailable"))).toBeTruthy();
  });
});
