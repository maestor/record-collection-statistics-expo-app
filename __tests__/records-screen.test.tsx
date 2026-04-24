import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { RecordsScreen } from "@/features/records/records-screen";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

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

function recordsPayload(page: number) {
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
}

describe("RecordsScreen", () => {
  beforeEach(() => {
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
    fireEvent.changeText(screen.getByLabelText(t("records.searchLabel")), "Muse");
    fireEvent.press(screen.getByRole("button", { name: t("records.searchButton") }));
    fireEvent.press(screen.getByRole("button", { name: `${t("records.filtersButton")} (1)` }));

    expect(await screen.findByText("Vinyl")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Vinyl" }));
    fireEvent.press(screen.getByRole("button", { name: t("records.sortArtist") }));
    fireEvent.press(screen.getByRole("button", { name: t("records.orderAscending") }));

    await waitFor(() => {
      const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) => String(call[0]));
      expect(urls.some((url) => url.includes("q=Muse"))).toBe(true);
      expect(urls.some((url) => url.includes("format=Vinyl"))).toBe(true);
      expect(urls.some((url) => url.includes("sort=artist"))).toBe(true);
      expect(urls.some((url) => url.includes("order=asc"))).toBe(true);
    });

    fireEvent.press(screen.getByRole("button", { name: t("records.loadMore") }));
    expect(await screen.findByText("Aikuiselämää")).toBeTruthy();
  });

  it("shows an empty state", async () => {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      return url.includes("/filters")
        ? jsonResponse(filtersPayload)
        : jsonResponse({ ...recordsPayload(1), data: [], meta: { page: 1, pageSize: 25, total: 0, totalPages: 0 } });
    });

    renderWithProviders(<RecordsScreen />);
    expect(await screen.findByText(t("records.emptyMessage"))).toBeTruthy();
  });
});
