import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

const dashboardPayload = {
  data: {
    addedYears: [{ itemCount: 46, releaseCount: 46, value: "2026" }],
    countries: [{ itemCount: 1789, releaseCount: 1788, value: "Finland" }],
    formats: [{ itemCount: 951, releaseCount: 951, value: "CD" }],
    genres: [{ itemCount: 2022, releaseCount: 2021, value: "Rock" }],
    labels: [{ itemCount: 133, releaseCount: 133, value: "Herodes" }],
    styles: [{ itemCount: 585, releaseCount: 585, value: "Pop Rock" }],
    summary: {
      addedRange: {
        first: "2019-08-15T05:09:03.000Z",
        last: "2026-04-19T09:53:55.000Z",
      },
      releaseYearRange: {
        max: 2026,
        min: 1969,
      },
      totals: {
        collectionItems: 2346,
        genres: 14,
        labels: 456,
        releases: 2345,
        styles: 164,
        uniqueArtists: 405,
      },
    },
    topArtists: [{ itemCount: 216, releaseCount: 216, value: "Klamydia" }],
  },
  meta: { limit: 8 },
};

const highlightCases = [
  { dimension: "artist", value: "Klamydia" },
  { dimension: "label", value: "Herodes" },
  { dimension: "format", value: "CD" },
  { dimension: "genre", value: "Rock" },
  { dimension: "style", value: "Pop Rock" },
  { dimension: "country", value: "Finland" },
  { dimension: "added_year", value: "2026" },
] as const;

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(async () => jsonResponse(dashboardPayload));
  });

  it("renders a loading state before dashboard data arrives", async () => {
    let resolveDashboardResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveDashboardResponse = resolve;
        }),
    );

    renderWithProviders(<DashboardScreen />);

    expect(screen.getByText(t("dashboard.loadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.loadingMessage"))).toBeTruthy();
    expect(screen.queryByText(t("dashboard.highlightsTitle"))).toBeNull();

    resolveDashboardResponse?.(jsonResponse(dashboardPayload));

    expect(await screen.findByText(t("dashboard.highlightsTitle"))).toBeTruthy();
  });

  it("renders dashboard data and supports every highlight action", async () => {
    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByText(t("dashboard.highlightsTitle"))).toBeTruthy();
    expect(screen.getByText("2 346")).toBeTruthy();
    expect(screen.getByText("2 345")).toBeTruthy();
    expect(screen.getByText("405")).toBeTruthy();
    expect(screen.getByText("456")).toBeTruthy();
    expect(screen.getByText("Äänitteet lisätty välillä 15.8.2019 - 19.4.2026")).toBeTruthy();

    const browseButton = screen.getByRole("button", { name: t("dashboard.browseRecords") });
    expect(browseButton.props.href).toBe("/records");

    for (const { dimension, value } of highlightCases) {
      const title = t(`dimensions.${dimension}`);
      const button = screen.getByRole("button", { name: title });

      fireEvent.press(button);

      expect(await screen.findByText(value)).toBeTruthy();
      expect(screen.getByRole("button", { name: title }).props.accessibilityState.selected).toBe(true);

      const viewFullLink = screen.getByRole("link", {
        name: `${t("breakdowns.viewFullPrefix")} ${title.toLowerCase()}`,
      });

      expect(viewFullLink.props.href).toEqual({
        params: { dimension },
        pathname: "/breakdowns/[dimension]",
      });
    }

    expect((globalThis.fetch as jest.Mock).mock.calls[0]?.[0]).toContain("/stats/dashboard?limit=8");
  });

  it("renders an API error with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "API down" }, 503));

    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("API down")).toBeTruthy();
    expect(screen.getByText(t("dashboard.errorTitle"))).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
