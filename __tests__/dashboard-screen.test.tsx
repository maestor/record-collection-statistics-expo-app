import * as React from "react";
import { fireEvent, screen } from "@testing-library/react-native";

import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { jsonResponse, renderWithProviders } from "../test/test-utils";

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

describe("DashboardScreen", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/health")) {
        return jsonResponse({
          database: {
            lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
            releaseCount: 2345,
            totalItems: 2346,
          },
          ok: true,
        });
      }

      return jsonResponse(dashboardPayload);
    });
  });

  it("renders dashboard data and refreshes it", async () => {
    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByText("Collection cache is healthy")).toBeTruthy();
    expect(screen.getByText("2,346")).toBeTruthy();
    expect(screen.getByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Browse records" }));
  });

  it("renders an API error with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "API down" }, 503));
    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByText("API down")).toBeTruthy();
    expect(screen.getByText("Dashboard unavailable")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
