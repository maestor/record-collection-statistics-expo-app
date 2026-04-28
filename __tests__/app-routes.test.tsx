import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { screen, waitFor } from "@testing-library/react-native";
import { Stack, Tabs, useLocalSearchParams } from "expo-router";

import RootLayout from "../app/_layout";
import TabsLayout from "../app/(tabs)/_layout";
import DashboardStackLayout from "../app/(tabs)/(dashboard)/_layout";
import DashboardRoute from "../app/(tabs)/(dashboard)/index";
import RandomRecordRoute from "../app/(tabs)/(dashboard)/random-record";
import InfoRoute from "../app/(tabs)/info";
import RecordsStackLayout from "../app/(tabs)/records/_layout";
import RecordsRoute from "../app/(tabs)/records/index";
import RecordsRandomRecordRoute from "../app/(tabs)/records/random-record";
import RecordDetailRoute from "../app/(tabs)/records/[releaseId]";
import StatisticsStackLayout from "../app/(tabs)/statistics/_layout";
import StatisticsRoute from "../app/(tabs)/statistics/index";
import BreakdownRoute from "../app/(tabs)/statistics/breakdowns/[dimension]";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

const dashboardPayload = {
  data: {
    addedYears: [{ itemCount: 1, releaseCount: 1, value: "2026" }],
    countries: [{ itemCount: 1, releaseCount: 1, value: "Finland" }],
    formats: [{ itemCount: 1, releaseCount: 1, value: "CD" }],
    genres: [{ itemCount: 1, releaseCount: 1, value: "Rock" }],
    labels: [{ itemCount: 1, releaseCount: 1, value: "Herodes" }],
    styles: [{ itemCount: 1, releaseCount: 1, value: "Pop Rock" }],
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
        collectionItems: 1,
        genres: 1,
        labels: 1,
        releases: 1,
        styles: 1,
        uniqueArtists: 1,
      },
    },
    topArtists: [{ itemCount: 1, releaseCount: 1, value: "Klamydia" }],
  },
  meta: { limit: 8 },
};

const filtersPayload = {
  data: {
    addedYears: [],
    artists: [],
    countries: [],
    formats: [],
    genres: [],
    labels: [],
    ranges: {
      added: { first: null, last: null },
      releaseYears: { max: null, min: null },
    },
    releaseYears: [],
    styles: [],
  },
  meta: { limit: 10 },
};

const recordsPayload = {
  data: [
    {
      artistsSort: "Muse",
      country: "Worldwide",
      dateAdded: "2026-04-18T08:10:33.000Z",
      formats: [{ descriptions: ["EP"], freeText: null, name: "Vinyl" }],
      instanceCount: 1,
      releaseId: 37098591,
      releaseYear: 2026,
      thumb: null,
      title: "Muscle Museum EP",
    },
  ],
  filters: {
    addedFrom: null,
    addedTo: null,
    artist: null,
    country: null,
    format: null,
    genre: null,
    label: null,
    order: "desc",
    q: null,
    sort: "date_added",
    style: null,
    yearFrom: null,
    yearTo: null,
  },
  meta: {
    page: 1,
    pageSize: 25,
    total: 1,
    totalPages: 1,
  },
};

const recordDetailPayload = {
  data: {
    artists: [{ artistId: 1003, name: "Muse", position: 0, role: "" }],
    artistsSort: "Muse",
    collectionItems: [],
    community: {
      have: 0,
      ratingAverage: null,
      ratingCount: 0,
      want: 0,
    },
    country: "Worldwide",
    coverImage: null,
    dataQuality: null,
    dateAdded: "2026-04-18T08:10:33.000Z",
    fetchedAt: "2026-04-23T17:26:53.282Z",
    formats: [{ descriptions: ["EP"], freeText: null, name: "Vinyl" }],
    genres: [],
    identifiers: [],
    instanceCount: 1,
    labels: [],
    releaseId: 37098591,
    releaseYear: 2026,
    released: "2026-04-18",
    resourceUrl: null,
    status: null,
    styles: [],
    thumb: null,
    title: "Muscle Museum EP",
    tracks: [],
    uri: null,
  },
};

const healthPayload = {
  database: {
    lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
    releaseCount: 2,
    totalItems: 2,
  },
  ok: true,
};

describe("Expo Router routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/stats/dashboard")) {
        return jsonResponse(dashboardPayload);
      }

      if (url.includes("/filters")) {
        return jsonResponse(filtersPayload);
      }

      if (url.includes("/records/")) {
        return jsonResponse(recordDetailPayload);
      }

      if (url.includes("/records")) {
        return jsonResponse(recordsPayload);
      }

      if (url.includes("/stats/breakdowns/")) {
        return jsonResponse({
          data: [{ itemCount: 1, releaseCount: 1, value: "Rock" }],
          meta: { dimension: "genre", total: 1 },
        });
      }

      return jsonResponse(healthPayload);
    });
  });

  it("registers root stack screens with the app providers", async () => {
    renderWithProviders(<RootLayout />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "(tabs)",
        options: { headerShown: false },
      }),
      undefined,
    );
  });

  it("registers tab screens with localized labels and icon renderers", () => {
    renderWithProviders(<TabsLayout />);

    const tabScreens = (Tabs.Screen as jest.Mock).mock.calls.map(([props]) => props);
    const dashboardTab = tabScreens.find((props) => props.name === "(dashboard)");
    const recordsTab = tabScreens.find((props) => props.name === "records");
    const statisticsTab = tabScreens.find((props) => props.name === "statistics");
    const infoTab = tabScreens.find((props) => props.name === "info");

    expect(dashboardTab?.options.title).toBe(t("navigation.dashboard"));
    expect(recordsTab?.options.title).toBe(t("navigation.records"));
    expect(statisticsTab?.options.title).toBe(t("navigation.statistics"));
    expect(infoTab?.options.title).toBe(t("navigation.info"));
    expect(dashboardTab?.options.headerShown).toBe(false);
    expect(recordsTab?.options.headerShown).toBe(false);
    expect(statisticsTab?.options.headerShown).toBe(false);

    const tabBarIcons = [
      dashboardTab?.options.tabBarIcon({ color: "red", focused: true, size: 20 }),
      dashboardTab?.options.tabBarIcon({ color: "red", focused: false, size: 20 }),
      recordsTab?.options.tabBarIcon({ color: "red", focused: true, size: 20 }),
      recordsTab?.options.tabBarIcon({ color: "red", focused: false, size: 20 }),
      statisticsTab?.options.tabBarIcon({ color: "red", focused: true, size: 20 }),
      statisticsTab?.options.tabBarIcon({ color: "red", focused: false, size: 20 }),
      infoTab?.options.tabBarIcon({ color: "red", focused: true, size: 20 }),
      infoTab?.options.tabBarIcon({ color: "red", focused: false, size: 20 }),
    ];

    expect(tabBarIcons.every((icon) => React.isValidElement(icon))).toBe(true);
  });

  it("registers the dashboard stack screens inside the dashboard tab", () => {
    renderWithProviders(<DashboardStackLayout />);

    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "index",
        options: { title: t("navigation.dashboard") },
      }),
      undefined,
    );
    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "random-record",
        options: { title: t("navigation.randomRecord") },
      }),
      undefined,
    );
  });

  it("registers the statistics stack screens inside the statistics tab", () => {
    renderWithProviders(<StatisticsStackLayout />);

    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "index",
        options: { title: t("navigation.statistics") },
      }),
      undefined,
    );
    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "breakdowns/[dimension]",
        options: { title: t("navigation.breakdown") },
      }),
      undefined,
    );
  });

  it("registers the records stack screens inside the records tab", () => {
    renderWithProviders(<RecordsStackLayout />);

    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "index",
        options: { title: t("navigation.records") },
      }),
      undefined,
    );
    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "[releaseId]",
        options: { title: t("navigation.record") },
      }),
      undefined,
    );
    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "random-record",
        options: { title: t("navigation.randomRecord") },
      }),
      undefined,
    );
  });

  it("renders the tab routes through their actual route components", async () => {
    const dashboardView = renderWithProviders(<DashboardRoute />);
    expect(await screen.findByText(t("dashboard.overviewTitle"))).toBeOnTheScreen();
    dashboardView.unmount();

    const statisticsView = renderWithProviders(<StatisticsRoute />);
    expect(
      await screen.findByRole("button", {
        name: t("statistics.currentDimensionLabel", {
          title: t("dimensions.artist"),
        }),
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: t("statistics.viewList") }).props
        .accessibilityState.selected,
    ).toBe(true);
    statisticsView.unmount();

    const recordsView = renderWithProviders(<RecordsRoute />);
    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    recordsView.unmount();

    renderWithProviders(<InfoRoute />);
    expect(await screen.findByText(t("dashboard.healthStatusHealthy"))).toBeOnTheScreen();
  });

  it("parses the record detail route id before loading the record", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ releaseId: "37098591" });

    renderWithProviders(<RecordDetailRoute />);

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    expect((globalThis.fetch as jest.Mock).mock.calls.some((call) => String(call[0]).includes("/records/37098591"))).toBe(
      true,
    );
  });

  it("renders the random record route through the shared detail screen", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      added_from: "2026-01-01T00:00:00.000Z",
      added_to: "2026-12-31T23:59:59.999Z",
      format: "Vinyl",
      q: "Muse",
    });

    renderWithProviders(<RandomRecordRoute />);

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    const randomUrl = (globalThis.fetch as jest.Mock).mock.calls
      .map((call) => String(call[0]))
      .find((url) => url.includes("/records/random"));

    expect(randomUrl).toContain("q=Muse");
    expect(randomUrl).toContain("format=Vinyl");
    expect(randomUrl).toContain("added_from=2026-01-01T00%3A00%3A00.000Z");
    expect(randomUrl).toContain("added_to=2026-12-31T23%3A59%3A59.999Z");
  });

  it("renders the records-stack random record route with query filters", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      artist: "Muse",
      genre: "Rock",
    });

    renderWithProviders(<RecordsRandomRecordRoute />);

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    const randomUrl = (globalThis.fetch as jest.Mock).mock.calls
      .map((call) => String(call[0]))
      .find((url) => url.includes("/records/random"));

    expect(randomUrl).toContain("artist=Muse");
    expect(randomUrl).toContain("genre=Rock");
  });

  it("renders the record detail invalid id state from route params", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ releaseId: "not-a-number" });

    renderWithProviders(<RecordDetailRoute />);

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(screen.getByText(t("recordDetail.invalidMessage"))).toBeOnTheScreen();
  });

  it("renders supported and unsupported breakdown route params", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ dimension: "genre" });
    const supportedView = renderWithProviders(<BreakdownRoute />);

    expect(await screen.findByText(t("dimensions.genre"))).toBeOnTheScreen();
    expect(screen.getByText("Rock")).toBeOnTheScreen();
    supportedView.unmount();

    (useLocalSearchParams as jest.Mock).mockReturnValue({ dimension: "unsupported" });
    renderWithProviders(<BreakdownRoute />);

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(screen.getByText(t("breakdowns.unsupportedMessage"))).toBeOnTheScreen();
  });
});
