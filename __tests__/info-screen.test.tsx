import * as React from "react";
import { Linking } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import { InfoScreen } from "@/features/info/info-screen";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

describe("InfoScreen", () => {
  beforeEach(() => {
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

  it("renders sync info and opens external links", async () => {
    const openUrlSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    renderWithProviders(<InfoScreen />);

    expect(await screen.findByText(t("dashboard.healthStatusHealthy"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.syncStatusTitle"))).toBeTruthy();
    expect(screen.getByText(t("info.copyright"))).toBeTruthy();

    fireEvent.press(screen.getByRole("link", { name: t("info.openExternalLink", { label: "LinkedIn" }) }));
    fireEvent.press(screen.getByRole("link", { name: t("info.openExternalLink", { label: "App" }) }));
    fireEvent.press(screen.getByRole("link", { name: t("info.openExternalLink", { label: "API" }) }));

    expect(openUrlSpy).toHaveBeenNthCalledWith(1, "https://www.linkedin.com/in/khaavisto/");
    expect(openUrlSpy).toHaveBeenNthCalledWith(2, "https://github.com/maestor/record-collection-statistics-expo-app");
    expect(openUrlSpy).toHaveBeenNthCalledWith(3, "https://github.com/maestor/record-collection-statistics-api");

    openUrlSpy.mockRestore();
  });
});
