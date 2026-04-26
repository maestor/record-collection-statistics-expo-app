import * as React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Keyboard } from "react-native";

import { RecordsScreen } from "@/features/records/records-screen";
import { colors } from "@/theme/colors";
import {
  endPressablePressedState,
  jsonResponse,
  renderWithProviders,
  startPressablePressedState,
  t,
} from "../test/test-utils";

const firstRecord = {
  artistsSort: "Muse",
  country: "Worldwide",
  dateAdded: "2026-04-18T08:10:33.000Z",
  formats: [
    {
      descriptions: ["EP"],
      freeText: "Limited edition",
      name: "Vinyl",
    },
  ],
  instanceCount: 1,
  releaseId: 37098591,
  releaseYear: 2026,
  thumb: "https://example.test/thumb.jpg",
  title: "Muscle Museum EP",
};

const secondRecord = {
  ...firstRecord,
  artistsSort: "Klamydia",
  releaseId: 123,
  title: "Aikuiselämää",
};

const filtersPayload = {
  data: {
    addedYears: [],
    artists: [{ itemCount: 1, releaseCount: 1, value: "Muse" }],
    countries: [{ itemCount: 1, releaseCount: 1, value: "Worldwide" }],
    formats: [{ itemCount: 1, releaseCount: 1, value: "Vinyl" }],
    genres: [{ itemCount: 1, releaseCount: 1, value: "Rock" }],
    labels: [],
    ranges: {
      added: { first: null, last: null },
      releaseYears: { max: 2026, min: 1969 },
    },
    releaseYears: [],
    styles: [],
  },
  meta: { limit: 10 },
};

const recordsPayload = (page: number) => {
  return {
    data: page === 1 ? [firstRecord] : [secondRecord],
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
      page,
      pageSize: 25,
      total: 2,
      totalPages: 2,
    },
  };
};

describe("RecordsScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return jsonResponse(filtersPayload);
      }

      const page = url.includes("page=2") ? 2 : 1;
      return jsonResponse(recordsPayload(page));
    });
  });

  it("searches, filters, sorts, and loads another page", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    expect(screen.getByText("Vinyl, EP, Limited edition")).toBeTruthy();
    const recordLink = screen.getByRole("link", {
      name: "Muscle Museum EP - Muse",
    });
    startPressablePressedState(recordLink);
    expect(recordLink).toHaveStyle({ opacity: 0.84 });
    endPressablePressedState(recordLink);
    await waitFor(() => {
      expect(recordLink).toHaveStyle({ opacity: 1 });
    });
    fireEvent.press(recordLink);
    expect(
      (useRouter as jest.Mock).mock.results[0]?.value.push,
    ).toHaveBeenCalledWith({
      params: { releaseId: "37098591" },
      pathname: "/records/[releaseId]",
    });
    const filtersButton = screen.getByRole("button", {
      name: t("records.filtersButton"),
    });
    startPressablePressedState(filtersButton);
    expect(filtersButton).toHaveStyle({ backgroundColor: colors.surface });
    endPressablePressedState(filtersButton);
    await waitFor(() => {
      expect(filtersButton).toHaveStyle({ backgroundColor: colors.surfaceMuted });
    });
    fireEvent.changeText(
      screen.getByLabelText(t("records.searchLabel")),
      "Muse",
    );
    fireEvent(screen.getByLabelText(t("records.searchLabel")), "submitEditing");
    fireEvent.press(
      screen.getByRole("button", { name: `${t("records.filtersButton")} (1)` }),
    );

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    expect(screen.getByText(t("records.filterArtists"))).toBeTruthy();
    expect(screen.queryByText(t("records.filterCountries"))).toBeNull();
    const recordsCallCount = () =>
      (globalThis.fetch as jest.Mock).mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/records")).length;
    const callsBeforeApply = recordsCallCount();
    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));
    fireEvent.press(
      screen.getByRole("button", { name: t("records.sortArtist") }),
    );
    fireEvent.press(
      screen.getByRole("button", { name: t("records.orderAscending") }),
    );

    expect(recordsCallCount()).toBe(callsBeforeApply);
    expect(
      screen.getByRole("button", { name: t("records.confirmFilters") }),
    ).toHaveStyle({ backgroundColor: colors.primary });
    fireEvent.press(
      screen.getByRole("button", { name: t("records.confirmFilters") }),
    );

    await waitFor(() => {
      const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
        String(call[0]),
      );
      expect(urls.some((url) => url.includes("q=Muse"))).toBe(true);
      expect(urls.some((url) => url.includes("format=Vinyl"))).toBe(true);
      expect(urls.some((url) => url.includes("sort=artist"))).toBe(true);
      expect(urls.some((url) => url.includes("order=asc"))).toBe(true);
    });

    fireEvent.press(
      screen.getByRole("button", { name: t("records.loadMore") }),
    );
    expect(await screen.findByText("Aikuiselämää")).toBeTruthy();
  });

  it("supports keyboard search submit, filter toggles, and clearing filters", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    const searchInput = screen.getByLabelText(t("records.searchLabel"));
    fireEvent.changeText(searchInput, " Muse ");
    fireEvent(searchInput, "submitEditing");
    fireEvent.press(
      screen.getByRole("button", { name: `${t("records.filtersButton")} (1)` }),
    );

    expect(await screen.findByRole("button", { name: "Rock" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Rock" }));
    fireEvent.press(screen.getByRole("button", { name: "Muse" }));
    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));
    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));
    fireEvent.press(
      screen.getByRole("button", { name: t("records.sortArtist") }),
    );
    fireEvent.press(
      screen.getByRole("button", { name: t("records.orderAscending") }),
    );
    const recordCallsBeforeApply = (globalThis.fetch as jest.Mock).mock.calls
      .map((call) => String(call[0]))
      .filter((url) => url.includes("/records")).length;

    expect(recordCallsBeforeApply).toBeGreaterThan(0);
    fireEvent.press(
      screen.getByRole("button", { name: t("records.confirmFilters") }),
    );

    await waitFor(() => {
      const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
        String(call[0]),
      );
      expect(urls.some((url) => url.includes("q=Muse"))).toBe(true);
      expect(urls.some((url) => url.includes("genre=Rock"))).toBe(true);
      expect(urls.some((url) => url.includes("artist=Muse"))).toBe(true);
      expect(urls.some((url) => url.includes("format=Vinyl"))).toBe(false);
      expect(urls.some((url) => url.includes("sort=artist"))).toBe(true);
      expect(urls.some((url) => url.includes("order=asc"))).toBe(true);
    });

    fireEvent.press(
      screen.getByRole("button", { name: `${t("records.filtersButton")} (3)` }),
    );
    expect(
      await screen.findByRole("button", { name: t("records.clearFilters") }),
    ).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: t("records.clearFilters") }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(t("records.searchLabel")).props.value).toBe("");
      expect(
        screen.getByRole("button", { name: t("records.filtersButton") }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: t("records.sortDateAdded") }).props
          .accessibilityState,
      ).toEqual({ selected: true });
      expect(
        screen.getByRole("button", { name: t("records.orderDescending") }).props
          .accessibilityState,
      ).toEqual({ selected: true });
    });
  });

  it("dismisses the keyboard after a submitted search succeeds", async () => {
    const dismissKeyboard = jest
      .spyOn(Keyboard, "dismiss")
      .mockImplementation(() => undefined);

    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    expect(dismissKeyboard).not.toHaveBeenCalled();

    const searchInput = screen.getByLabelText(t("records.searchLabel"));
    fireEvent.changeText(searchInput, " Muse ");
    fireEvent(searchInput, "submitEditing");

    await waitFor(() => {
      const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
        String(call[0]),
      );

      expect(urls.some((url) => url.includes("q=Muse"))).toBe(true);
      expect(dismissKeyboard).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps the keyboard open when a submitted search fails", async () => {
    const dismissKeyboard = jest
      .spyOn(Keyboard, "dismiss")
      .mockImplementation(() => undefined);

    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return jsonResponse(filtersPayload);
      }

      if (url.includes("q=Muse")) {
        return jsonResponse({ error: "Search failed" }, 503);
      }

      return jsonResponse(recordsPayload(1));
    });

    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    const searchInput = screen.getByLabelText(t("records.searchLabel"));
    fireEvent.changeText(searchInput, "Muse");
    fireEvent(searchInput, "submitEditing");

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(dismissKeyboard).not.toHaveBeenCalled();
  });

  it("does not render a manual search button and keeps the filters trigger full width", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    expect(
      screen.queryByRole("button", { name: /hae/i }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: t("records.filtersButton") })).toHaveStyle({
      width: "100%",
    });
  });

  it("loads filters only after opening the filter sheet, reuses the cached response, and closes without refetch when nothing changed", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    const getFilterCalls = () =>
      (globalThis.fetch as jest.Mock).mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/filters"));

    expect(getFilterCalls()).toHaveLength(0);

    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    expect(getFilterCalls()).toHaveLength(1);
    expect(getFilterCalls()[0]).toContain("dimensions=artist%2Cformat%2Cgenre");
    const recordCallsBeforeClose = (globalThis.fetch as jest.Mock).mock.calls
      .map((call) => String(call[0]))
      .filter((url) => url.includes("/records")).length;

    fireEvent.press(
      screen.getByRole("button", { name: t("records.closeFilters") }),
    );
    await waitFor(() => {
      expect(screen.queryByLabelText(t("records.filterPanelLabel"))).toBeNull();
    });
    expect(
      (globalThis.fetch as jest.Mock).mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/records")).length,
    ).toBe(recordCallsBeforeClose);

    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    expect(getFilterCalls()).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Vinyl" }).props.accessibilityState.selected).toBeUndefined();
    expect(screen.getByRole("button", { name: t("records.sortDateAdded") }).props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it("applies draft filter changes when closing the filter sheet", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    const recordCallsBeforeClose = (globalThis.fetch as jest.Mock).mock.calls
      .map((call) => String(call[0]))
      .filter((url) => url.includes("/records")).length;

    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));
    fireEvent.press(
      screen.getByRole("button", { name: t("records.sortArtist") }),
    );
    fireEvent.press(
      screen.getByRole("button", { name: t("records.confirmFilters") }),
    );

    await waitFor(() => {
      const recordUrls = (globalThis.fetch as jest.Mock).mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/records"));

      expect(recordUrls).toHaveLength(recordCallsBeforeClose + 1);
      expect(recordUrls.some((url) => url.includes("format=Vinyl"))).toBe(true);
      expect(recordUrls.some((url) => url.includes("sort=artist"))).toBe(true);
    });
  });

  it("shows pressed styling for filter sheet buttons", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );

    const closeButton = screen.getByRole("button", {
      name: t("records.closeFilters"),
    });

    startPressablePressedState(closeButton);
    expect(closeButton).toHaveStyle({ opacity: 0.8 });

    endPressablePressedState(closeButton);
    await waitFor(() => {
      expect(closeButton).toHaveStyle({ opacity: 1 });
    });
  });

  it("changes the close button into a confirm action when draft filters differ", async () => {
    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );
    expect(await screen.findByText("Vinyl")).toBeTruthy();

    const closeButton = screen.getByRole("button", {
      name: t("records.closeFilters"),
    });
    expect(closeButton).toHaveStyle({ backgroundColor: colors.surfaceMuted });

    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));

    expect(
      screen.getByRole("button", { name: t("records.confirmFilters") }),
    ).toHaveStyle({ backgroundColor: colors.primary });
  });

  it("starts search automatically after a short pause and clears it when input is emptied", async () => {
    jest.useFakeTimers();
    const dismissKeyboard = jest
      .spyOn(Keyboard, "dismiss")
      .mockImplementation(() => undefined);

    try {
      renderWithProviders(<RecordsScreen />);

      expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();

      const searchInput = screen.getByLabelText(t("records.searchLabel"));
      const recordsCallCount = () =>
        (globalThis.fetch as jest.Mock).mock.calls
          .map((call) => String(call[0]))
          .filter((url) => url.includes("/records")).length;

      const initialRecordCalls = recordsCallCount();

      expect(
        screen.queryByRole("button", { name: t("records.clearSearch") }),
      ).toBeNull();

      fireEvent.changeText(searchInput, "Mu");
      expect(
        screen.getByRole("button", { name: t("records.clearSearch") }),
      ).toBeTruthy();
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(recordsCallCount()).toBe(initialRecordCalls);
      });
      expect(dismissKeyboard).not.toHaveBeenCalled();

      fireEvent.changeText(searchInput, "Muse");
      act(() => {
        jest.advanceTimersByTime(499);
      });

      expect(recordsCallCount()).toBe(initialRecordCalls);
      expect(dismissKeyboard).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
          String(call[0]),
        );
        expect(urls.some((url) => url.includes("q=Muse"))).toBe(true);
        expect(dismissKeyboard).toHaveBeenCalledTimes(1);
      });

      const callsAfterAutoSearch = recordsCallCount();

      fireEvent.press(
        screen.getByRole("button", { name: t("records.clearSearch") }),
      );

      await waitFor(() => {
        expect(screen.getByLabelText(t("records.searchLabel")).props.value).toBe(
          "",
        );
        expect(
          screen.queryByRole("button", { name: t("records.clearSearch") }),
        ).toBeNull();
        expect(dismissKeyboard).toHaveBeenCalledTimes(2);
      });
      expect(recordsCallCount()).toBe(callsAfterAutoSearch);
    } finally {
      jest.useRealTimers();
    }
  });

  it("shows an empty state", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      return url.includes("/filters")
        ? jsonResponse(filtersPayload)
        : jsonResponse({
            ...recordsPayload(1),
            data: [],
            meta: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
          });
    });

    renderWithProviders(<RecordsScreen />);
    expect(await screen.findByText(t("records.emptyMessage"))).toBeTruthy();
  });

  it("renders record cards with fallback metadata from the API response", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return jsonResponse(filtersPayload);
      }

      return jsonResponse({
        ...recordsPayload(1),
        data: [
          {
            ...firstRecord,
            artistsSort: null,
            country: null,
            dateAdded: "not-a-date",
            formats: [{ descriptions: ["EP"], freeText: null, name: "Vinyl" }],
            releaseYear: 0,
            thumb: null,
            title: "Untitled Release",
          },
        ],
      });
    });

    renderWithProviders(<RecordsScreen />);

    expect(
      await screen.findByRole("link", {
        name: "Untitled Release - Tuntematon artisti",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Tuntematon artisti")).toBeTruthy();
    expect(screen.getByText("Tuntematon · Tuntematon maa")).toBeTruthy();
    expect(screen.getByText("Lisätty Tuntematon")).toBeTruthy();
  });

  it("keeps the load more button busy and disabled while the next page is loading", async () => {
    let resolveNextPageResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return Promise.resolve(jsonResponse(filtersPayload));
      }

      if (url.includes("page=2")) {
        return new Promise<Response>((resolve) => {
          resolveNextPageResponse = resolve;
        });
      }

      return Promise.resolve(jsonResponse(recordsPayload(1)));
    });

    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    const loadMoreButton = screen.getByRole("button", {
      name: t("records.loadMore"),
    });

    fireEvent.press(loadMoreButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: t("records.loadMore") }).props
          .accessibilityState,
      ).toEqual({
        busy: true,
        disabled: true,
      });
    });
    resolveNextPageResponse?.(jsonResponse(recordsPayload(2)));

    expect(await screen.findByText("Aikuiselämää")).toBeTruthy();
  });

  it("shows a filter loading message while filter options are loading", async () => {
    let resolveFiltersResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return new Promise<Response>((resolve) => {
          resolveFiltersResponse = resolve;
        });
      }

      return Promise.resolve(jsonResponse(recordsPayload(1)));
    });

    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: t("records.filtersButton") }),
    );
    expect(screen.getByLabelText(t("records.filterPanelLabel"))).toBeTruthy();

    expect(screen.getByText(t("records.loadingFilters"))).toBeTruthy();

    resolveFiltersResponse?.(jsonResponse(filtersPayload));

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: t("records.closeFilters") }),
    );
    await waitFor(() => {
      expect(screen.queryByLabelText(t("records.filterPanelLabel"))).toBeNull();
    });
  });

  it("shows a loading state while records are still loading", async () => {
    let resolveRecordsResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return Promise.resolve(jsonResponse(filtersPayload));
      }

      return new Promise<Response>((resolve) => {
        resolveRecordsResponse = resolve;
      });
    });

    renderWithProviders(<RecordsScreen />);

    expect(screen.getByText(t("records.loadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("records.loadingMessage"))).toBeTruthy();

    resolveRecordsResponse?.(jsonResponse(recordsPayload(1)));

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
  });

  it("shows an error state and retries record loading", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/filters")) {
        return jsonResponse(filtersPayload);
      }

      return jsonResponse({ error: "Records failed" }, 503);
    });

    renderWithProviders(<RecordsScreen />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("Records failed")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      const recordCalls = (globalThis.fetch as jest.Mock).mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/records"));

      expect(recordCalls).toHaveLength(2);
    });
  });
});
