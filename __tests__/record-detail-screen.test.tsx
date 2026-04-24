import * as React from "react";
import { fireEvent, screen } from "@testing-library/react-native";

import { RecordDetailScreen } from "@/features/records/record-detail-screen";
import { jsonResponse, renderWithProviders, resetSecureStore } from "../test/test-utils";

const recordDetail = {
  artists: [{ artistId: 1003, name: "Muse", position: 0, role: "" }],
  artistsSort: "Muse",
  collectionItems: [
    {
      dateAdded: "2026-04-18T08:10:33.000Z",
      fieldValues: [],
      folderId: 2047581,
      instanceId: 2136058233,
      rating: 4,
    },
  ],
  community: {
    have: 1581,
    ratingAverage: 4.88,
    ratingCount: 109,
    want: 140,
  },
  country: "Worldwide",
  coverImage: "https://example.test/cover.jpg",
  dataQuality: "Needs Vote",
  fetchedAt: "2026-04-23T17:26:53.282Z",
  firstDateAdded: "2026-04-18T08:10:33.000Z",
  formats: [
    {
      descriptions: ["12\"", "EP"],
      name: "Vinyl",
      qty: "1",
    },
  ],
  genres: ["Rock"],
  identifiers: [{ description: "Text", type: "Barcode", value: "5026854087467" }],
  instanceCount: 1,
  labels: [{ catno: "5026854087467", labelId: 134882, name: "Warner Records", position: 0 }],
  latestDateAdded: "2026-04-18T08:10:33.000Z",
  lowestPrice: 18.69,
  numForSale: 108,
  releaseId: 37098591,
  releaseYear: 2026,
  released: "2026-04-18",
  resourceUrl: "https://api.discogs.com/releases/37098591",
  status: "Accepted",
  styles: ["Indie Rock"],
  thumb: "https://example.test/thumb.jpg",
  title: "Muscle Museum EP",
  tracks: [
    { duration: "", position: "A1", title: "Muscle Museum", type: "track" },
    { duration: "", position: "A2", title: "Sober", type: "track" },
  ],
  uri: "https://www.discogs.com/release/37098591",
};

describe("RecordDetailScreen", () => {
  beforeEach(() => {
    resetSecureStore();
    globalThis.fetch = jest.fn(async () => jsonResponse({ data: recordDetail }));
  });

  it("renders record metadata, tracks, and community stats", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    expect(screen.getByText("Muse")).toBeTruthy();
    expect(screen.getByText("1 12\" EP Vinyl")).toBeTruthy();
    expect(screen.getByText("4.88 from 109 ratings")).toBeTruthy();
    expect(screen.getByText("Sober")).toBeTruthy();
  });

  it("renders invalid release id state", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={Number.NaN} />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("The release id in this route is not valid.")).toBeTruthy();
  });

  it("renders API errors with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Release not found" }, 404));
    renderWithProviders(<RecordDetailScreen releaseId={404} />);

    expect(await screen.findByText("Release not found")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
