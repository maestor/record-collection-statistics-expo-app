import * as React from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react-native";
import { Modal } from "react-native";

import * as apiQueries from "@/api/queries";
import { StatisticsScreen } from "@/features/statistics/statistics-screen";
import type { StatisticDimension } from "@/features/statistics/statistics-helpers";
import { colors } from "@/theme/colors";
import {
  endPressablePressedState,
  jsonResponse,
  renderWithProviders,
  startPressablePressedState,
  t,
} from "../test/test-utils";

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

const formatBreakdownPayload = {
  data: [
    { itemCount: 40, releaseCount: 40, value: "CD" },
    { itemCount: 20, releaseCount: 20, value: "Vinyl" },
    { itemCount: 15, releaseCount: 15, value: "Cassette" },
    { itemCount: 10, releaseCount: 10, value: "File" },
    { itemCount: 7, releaseCount: 7, value: "SACD" },
    { itemCount: 5, releaseCount: 5, value: "DVD" },
    { itemCount: 2, releaseCount: 2, value: "Blu-ray" },
    { itemCount: 1, releaseCount: 1, value: "MiniDisc" },
    { itemCount: 1, releaseCount: 1, value: "VHS" },
  ],
  meta: { dimension: "format" },
};

const artistBreakdownPayload = {
  data: [
    { itemCount: 12, releaseCount: 12, value: "Klamydia" },
    { itemCount: 3, releaseCount: 3, value: "CMX" },
  ],
  meta: { dimension: "artist" },
};
const artistLongTailBreakdownPayload = {
  data: [
    ...Array.from({ length: 30 }, (_, index) => ({
      itemCount: 30 - index,
      releaseCount: 30 - index,
      value: `Artisti ${index + 1}`,
    })),
    { itemCount: 4, releaseCount: 4, value: "Artisti 31" },
    { itemCount: 3, releaseCount: 3, value: "Artisti 32" },
  ],
  meta: { dimension: "artist" },
};

const yearBreakdownPayload = {
  data: [
    { itemCount: 12, releaseCount: 12, value: "2026" },
    { itemCount: 5, releaseCount: 5, value: "2024" },
    { itemCount: 8, releaseCount: 8, value: "2025" },
  ],
  meta: { dimension: "added_year" },
};

const fetchStatisticsResponse = async (
  input: RequestInfo | URL,
): Promise<Response> => {
  const url = String(input);

  if (url.includes("/stats/dashboard")) {
    return jsonResponse(dashboardPayload);
  }

  if (url.includes("/stats/breakdowns/format")) {
    return jsonResponse(formatBreakdownPayload);
  }

  if (url.includes("/stats/breakdowns/artist")) {
    return jsonResponse(artistBreakdownPayload);
  }

  if (url.includes("/stats/breakdowns/added_year")) {
    return jsonResponse(yearBreakdownPayload);
  }

  return jsonResponse({ error: "Missing test response" }, 500);
};

const getCurrentDimensionLabel = (dimension: StatisticDimension) =>
  t("statistics.currentDimensionLabel", {
    title: t(`dimensions.${dimension}`),
  });

const openDimensionSelector = (dimension: StatisticDimension) => {
  fireEvent.press(
    screen.getByRole("button", {
      name: getCurrentDimensionLabel(dimension),
    }),
  );

  expect(
    screen.getByLabelText(t("statistics.selectorLabel")),
  ).toBeTruthy();
};

const selectDimension = (
  currentDimension: StatisticDimension,
  nextDimension: StatisticDimension,
) => {
  openDimensionSelector(currentDimension);
  const selector = screen.getByLabelText(t("statistics.selectorLabel"));
  fireEvent.press(
    within(selector).getByRole("button", {
      name: t(`dimensions.${nextDimension}`),
    }),
  );
};

describe("StatisticsScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(fetchStatisticsResponse);
  });

  it("renders a loading state before dashboard data arrives", async () => {
    let resolveDashboardResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return new Promise<Response>((resolve) => {
          resolveDashboardResponse = resolve;
        });
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(screen.getByText(t("dashboard.loadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.loadingMessage"))).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: getCurrentDimensionLabel("artist"),
      }),
    ).toBeNull();

    resolveDashboardResponse?.(jsonResponse(dashboardPayload));

    expect(
      await screen.findByRole("button", {
        name: getCurrentDimensionLabel("artist"),
      }),
    ).toBeTruthy();
  });

  it("keeps the loading state when dashboard data has not restored yet", () => {
    jest.spyOn(apiQueries, "useDashboardStatsQuery").mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof apiQueries.useDashboardStatsQuery>);

    renderWithProviders(<StatisticsScreen />);

    expect(screen.getByText(t("dashboard.loadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("dashboard.loadingMessage"))).toBeTruthy();
  });

  it("defaults to list mode and supports every statistic action", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: t("statistics.viewList") }).props
        .accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: t("statistics.viewCharts") }).props
        .accessibilityState.selected,
    ).toBeUndefined();

    const statisticCases = [
      { dimension: "artist", value: "Klamydia" },
      { dimension: "label", value: "Herodes" },
      { dimension: "format", value: "CD" },
      { dimension: "genre", value: "Rock" },
      { dimension: "style", value: "Pop Rock" },
      { dimension: "country", value: "Finland" },
      { dimension: "added_year", value: "2026" },
    ] as const;

    let currentDimension: StatisticDimension = "artist";

    for (const { dimension, value } of statisticCases) {
      const title = t(`dimensions.${dimension}`);
      selectDimension(currentDimension, dimension);

      expect(await screen.findByText(value)).toBeTruthy();
      expect(
        screen.getByRole("button", {
          name: getCurrentDimensionLabel(dimension),
        }),
      ).toBeTruthy();

      const viewFullLink = screen.getByRole("link", {
        name: `${t("breakdowns.viewFullPrefix")} ${title.toLowerCase()}`,
      });

      expect(viewFullLink.props.href).toEqual({
        params: { dimension },
        pathname: "/statistics/breakdowns/[dimension]",
      });

      currentDimension = dimension;
    }

    expect((globalThis.fetch as jest.Mock).mock.calls[0]?.[0]).toContain("/stats/dashboard?limit=8");
  });

  it("opens and closes the statistic selector from the active one-line trigger", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    openDimensionSelector("artist");

    const selector = screen.getByLabelText(t("statistics.selectorLabel"));

    expect(screen.getByText(t("statistics.selectorTitle"))).toBeTruthy();
    expect(
      screen.getByRole("button", { name: t("statistics.closeSelector") }),
    ).toBeTruthy();
    expect(
      within(selector).getByRole("button", { name: t("dimensions.artist") })
        .props.accessibilityState,
    ).toEqual({ selected: true });
    expect(screen.getByText(t("statistics.selectedDimension"))).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: t("statistics.closeSelector") }),
    );

    expect(screen.queryByText(t("statistics.selectorTitle"))).toBeNull();
    expect(
      screen.getByRole("button", {
        name: getCurrentDimensionLabel("artist"),
      }),
    ).toBeTruthy();
  });

  it("closes the statistic selector when the native dismiss request fires", async () => {
    const view = renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    openDimensionSelector("artist");

    fireEvent(view.UNSAFE_getByType(Modal), "onRequestClose");

    expect(screen.queryByText(t("statistics.selectorTitle"))).toBeNull();
  });

  it("shows pressed styling for selector trigger and modal actions", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    const trigger = screen.getByRole("button", {
      name: getCurrentDimensionLabel("artist"),
    });

    startPressablePressedState(trigger);
    expect(trigger).toHaveStyle({ backgroundColor: colors.surface });

    endPressablePressedState(trigger);
    await waitFor(() => {
      expect(trigger).toHaveStyle({ backgroundColor: colors.surfaceMuted });
    });

    openDimensionSelector("artist");

    const selector = screen.getByLabelText(t("statistics.selectorLabel"));
    const closeButton = screen.getByRole("button", {
      name: t("statistics.closeSelector"),
    });
    const labelOption = within(selector).getByRole("button", {
      name: t("dimensions.label"),
    });

    startPressablePressedState(closeButton);
    expect(closeButton).toHaveStyle({ backgroundColor: colors.surfaceMuted });

    endPressablePressedState(closeButton);
    await waitFor(() => {
      expect(closeButton).toHaveStyle({ backgroundColor: "transparent" });
    });

    startPressablePressedState(labelOption);
    expect(labelOption).toHaveStyle({ backgroundColor: colors.surfaceMuted });

    endPressablePressedState(labelOption);
    await waitFor(() => {
      expect(labelOption).toHaveStyle({ backgroundColor: colors.surface });
    });
  });

  it("shows pressed styling for the unselected graph toggle", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    const chartsButton = screen.getByRole("button", {
      name: t("statistics.viewCharts"),
    });

    startPressablePressedState(chartsButton);
    expect(chartsButton).toHaveStyle({ backgroundColor: colors.surface });

    endPressablePressedState(chartsButton);
    await waitFor(() => {
      expect(chartsButton).toHaveStyle({ backgroundColor: "transparent" });
    });
  });

  it("preserves the selected dimension when switching to chart mode and back", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    selectDimension("artist", "format");
    expect(await screen.findByText("CD")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(
      await screen.findByText(
        t("statistics.chartTitle", {
          title: t("dimensions.format"),
        }),
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText(t("statistics.chartSectionLabel", { title: t("dimensions.format") }))).toBeTruthy();
    expect(screen.getByText(t("statistics.chartLegendTitle"))).toBeTruthy();
    expect(screen.getByText(t("statistics.other"))).toBeTruthy();
    expect(
      screen.getByLabelText(
        t("statistics.donutCenterLabel", {
          count: "40",
          label: "CD",
          percentage: "39,6",
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByLabelText(
        t("statistics.legendItemAccessibilityLabel", {
          count: "40",
          label: "CD",
          percentage: "39,6",
        }),
      ),
    ).toBeTruthy();
    expect(
      (globalThis.fetch as jest.Mock).mock.calls.some(([url]) =>
        String(url).includes("/stats/breakdowns/format"),
      ),
    ).toBe(true);

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewList") }));

    expect(
      await screen.findByRole("link", {
        name: `${t("breakdowns.viewFullPrefix")} ${t("dimensions.format").toLowerCase()}`,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: getCurrentDimensionLabel("format"),
      }),
    ).toBeTruthy();
  });

  it("renders the year graph without an other bucket", async () => {
    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    selectDimension("artist", "added_year");
    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(
      await screen.findByText(
        t("statistics.chartTitle", {
          title: t("dimensions.added_year"),
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByLabelText(
        t("statistics.chartScrollLabel", { title: t("dimensions.added_year") }),
      ),
    ).toBeTruthy();
    expect(
      screen.getAllByText(/202[4-6]/).map((node) => node.props.children),
    ).toEqual(["2026", "2025", "2024"]);
    expect(screen.queryByText(t("statistics.other"))).toBeNull();
  });

  it("renders zero totals as zero percent in chart mode", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return jsonResponse(dashboardPayload);
      }

      if (url.includes("/stats/breakdowns/artist")) {
        return jsonResponse({
          data: [{ itemCount: 0, releaseCount: 0, value: "Klamydia" }],
          meta: { dimension: "artist" },
        });
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(
      await screen.findByLabelText(
        t("statistics.donutCenterLabel", {
          count: "0",
          label: "Klamydia",
          percentage: "0",
        }),
      ),
    ).toBeTruthy();
    expect(
      await screen.findByLabelText(
        t("statistics.legendItemAccessibilityLabel", {
          count: "0",
          label: "Klamydia",
          percentage: "0",
        }),
      ),
    ).toBeTruthy();
  });

  it("shows a summary instead of a Muut donut slice for long-tail artist data", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return jsonResponse(dashboardPayload);
      }

      if (url.includes("/stats/breakdowns/artist")) {
        return jsonResponse(artistLongTailBreakdownPayload);
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(
      await screen.findByText(
        t("statistics.chartTitle", {
          title: t("dimensions.artist"),
        }),
      ),
    ).toBeTruthy();
    expect(screen.queryByText(t("statistics.other"))).toBeNull();
    expect(
      screen.getByText(
        t("statistics.otherSummary", {
          category: t("statistics.otherSummaryArtist"),
          count: "17",
          total: "127",
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.queryByLabelText(
        t("statistics.legendItemAccessibilityLabel", {
          count: "7",
          label: t("statistics.other"),
          percentage: "6,7",
        }),
      ),
    ).toBeNull();
  });

  it("renders a loading state while the chart breakdown is loading", async () => {
    let resolveBreakdownResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return Promise.resolve(jsonResponse(dashboardPayload));
      }

      if (url.includes("/stats/breakdowns/artist")) {
        return new Promise<Response>((resolve) => {
          resolveBreakdownResponse = resolve;
        });
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(screen.getByText(t("statistics.graphLoadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("statistics.graphLoadingMessage"))).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: getCurrentDimensionLabel("artist"),
      }),
    ).toBeTruthy();

    resolveBreakdownResponse?.(jsonResponse(artistBreakdownPayload));

    expect(
      await screen.findByText(
        t("statistics.chartTitle", {
          title: t("dimensions.artist"),
        }),
      ),
    ).toBeTruthy();
  });

  it("keeps the chart loading state when breakdown data has not restored yet", async () => {
    jest.spyOn(apiQueries, "useDashboardStatsQuery").mockReturnValue({
      data: dashboardPayload,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof apiQueries.useDashboardStatsQuery>);
    jest.spyOn(apiQueries, "useBreakdownQuery").mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof apiQueries.useBreakdownQuery>);

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(screen.getByText(t("statistics.graphLoadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("statistics.graphLoadingMessage"))).toBeTruthy();
  });

  it("renders an empty chart state when the selected breakdown has no values", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return jsonResponse(dashboardPayload);
      }

      if (url.includes("/stats/breakdowns/artist")) {
        return jsonResponse({
          data: [],
          meta: { dimension: "artist" },
        });
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(await screen.findByText(t("statistics.graphEmptyTitle"))).toBeTruthy();
    expect(screen.getByText(t("common.noValuesYet"))).toBeTruthy();
  });

  it("renders a chart API error with retry", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return jsonResponse(dashboardPayload);
      }

      if (url.includes("/stats/breakdowns/artist")) {
        return jsonResponse({ error: "Breakdown down" }, 503);
      }

      return fetchStatisticsResponse(input);
    });

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByText("Klamydia")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("statistics.viewCharts") }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(t("statistics.graphErrorTitle"))).toBeTruthy();
    expect(screen.getByText("Breakdown down")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });
  });

  it("renders a dashboard API error with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "API down" }, 503));

    renderWithProviders(<StatisticsScreen />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("API down")).toBeTruthy();
    expect(screen.getByText(t("dashboard.errorTitle"))).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
