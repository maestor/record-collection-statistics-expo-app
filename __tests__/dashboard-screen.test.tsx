import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import * as apiQueries from "@/api/queries";
import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { colors } from "@/theme/colors";
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
      collectionValue: {
        maximum: 72.25,
        median: 58.5,
        minimum: 41.75,
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

    expect(screen.getByText(t("dashboard.loadingTitle"))).toBeOnTheScreen();
    expect(screen.getByText(t("dashboard.loadingMessage"))).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: t("dashboard.statisticsButton") }),
    ).not.toBeOnTheScreen();

    resolveDashboardResponse?.(jsonResponse(dashboardPayload));

    expect(
      await screen.findByRole("button", { name: t("dashboard.statisticsButton") }),
    ).toBeOnTheScreen();
  });

  it("keeps the loading state when the query has not restored data yet", () => {
    jest.spyOn(apiQueries, "useDashboardStatsQuery").mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof apiQueries.useDashboardStatsQuery>);

    renderWithProviders(<DashboardScreen />);

    expect(screen.getByText(t("dashboard.loadingTitle"))).toBeOnTheScreen();
    expect(screen.getByText(t("dashboard.loadingMessage"))).toBeOnTheScreen();
  });

  it("renders dashboard overview actions with the updated summary cards", async () => {
    renderWithProviders(<DashboardScreen />);

    expect(
      await screen.findByRole("button", { name: t("dashboard.statisticsButton") }),
    ).toBeOnTheScreen();
    expect(screen.getByText("2 345")).toBeOnTheScreen();
    expect(screen.getByText("59 €")).toBeOnTheScreen();
    expect(screen.getByText("405")).toBeOnTheScreen();
    expect(screen.getByText("456")).toBeOnTheScreen();
    expect(screen.getByText("Äänitteet lisätty välillä 15.8.2019 - 19.4.2026")).toBeOnTheScreen();
    expect(screen.getByText("Eniten artistilta: Klamydia")).toBeOnTheScreen();
    expect(screen.getByText("Eniten formaattia: CD")).toBeOnTheScreen();
    expect(screen.queryByText("Herodes")).not.toBeOnTheScreen();

    const statisticsButton = screen.getByRole("button", { name: t("dashboard.statisticsButton") });
    expect(statisticsButton.props.href).toBe("/statistics");
    expect(statisticsButton).toHaveStyle({
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
    });

    const browseButton = screen.getByRole("button", { name: t("dashboard.browseRecords") });
    expect(browseButton.props.href).toBe("/records");
    expect(browseButton).toHaveStyle({
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    });

    const randomRecordButton = screen.getByRole("button", {
      name: t("dashboard.randomRecordButton"),
    });
    expect(randomRecordButton.props.href).toBe("/records/random");
    expect(randomRecordButton).toHaveStyle({
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
    });

    expect((globalThis.fetch as jest.Mock).mock.calls[0]?.[0]).toContain(
      "/stats/dashboard?limit=8",
    );
  });

  it("omits top breakdown rows when statistic sources are empty", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        ...dashboardPayload,
        data: {
          ...dashboardPayload.data,
          formats: [],
          topArtists: [],
        },
      }),
    );

    renderWithProviders(<DashboardScreen />);

    expect(
      await screen.findByRole("button", { name: t("dashboard.statisticsButton") }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Eniten artistilta: Klamydia")).not.toBeOnTheScreen();
    expect(screen.queryByText("Eniten formaattia: CD")).not.toBeOnTheScreen();
  });

  it("renders an unknown median value when collection value data is missing", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        ...dashboardPayload,
        data: {
          ...dashboardPayload.data,
          summary: {
            ...dashboardPayload.data.summary,
            collectionValue: {
              ...dashboardPayload.data.summary.collectionValue,
              median: null,
            },
          },
        },
      }),
    );

    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByText("Tuntematon")).toBeOnTheScreen();
  });

  it("renders an API error with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "API down" }, 503));

    renderWithProviders(<DashboardScreen />);

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(screen.getByText("API down")).toBeOnTheScreen();
    expect(screen.getByText(t("dashboard.errorTitle"))).toBeOnTheScreen();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
