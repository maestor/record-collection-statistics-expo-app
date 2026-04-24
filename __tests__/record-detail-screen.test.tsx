import * as React from "react";
import { fireEvent, screen } from "@testing-library/react-native";

import { RecordDetailScreen } from "@/features/records/record-detail-screen";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

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
  dateAdded: "2026-04-18T08:10:33.000Z",
  fetchedAt: "2026-04-23T17:26:53.282Z",
  formats: [
    {
      descriptions: ["12\"", "EP"],
      freeText: "Limited edition",
      name: "Vinyl",
    },
  ],
  genres: ["Rock"],
  identifiers: [
    { description: "Text", type: "Barcode", value: "5026854087467" },
    { description: null, type: "Barcode", value: "5026854087468" },
    { description: null, type: "Label Code", value: "LC01234" },
  ],
  instanceCount: 1,
  labels: [
    { catno: "5026854087467", labelId: 134882, name: "Warner Records", position: 0 },
    { catno: "9362499549", labelId: 134882, name: "Warner Records", position: 1 },
    { catno: null, labelId: 999, name: "Mushroom Pillow", position: 2 },
  ],
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
    globalThis.fetch = jest.fn(async () => jsonResponse({ data: recordDetail }));
  });

  it("renders record metadata, tracks, and community stats", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("Muscle Museum EP")).toBeTruthy();
    expect(screen.getByText("Muse")).toBeTruthy();
    expect(screen.getByText("Vinyl, 12\", EP, Limited edition")).toBeTruthy();
    expect(screen.getAllByText("18.4.2026")).toHaveLength(2);
    expect(screen.getByText(t("recordDetail.collectionAddedOn"))).toBeTruthy();
    expect(screen.queryByText("Vuosi")).toBeNull();
    expect(screen.queryByText("Kappaleita")).toBeNull();
    expect(screen.queryByText("Yhteisö")).toBeNull();
    expect(screen.getAllByText("Barcode")).toHaveLength(1);
    expect(screen.getByText("5026854087467 · Text\n5026854087468")).toBeTruthy();
    expect(screen.getByText("LC01234")).toBeTruthy();
    expect(screen.getAllByText("Warner Records")).toHaveLength(1);
    expect(screen.getByText("5026854087467\n9362499549")).toBeTruthy();
    expect(screen.getByText(t("recordDetail.noCatalogNumber"))).toBeTruthy();
    expect(screen.getByText("Sober")).toBeTruthy();
  });

  it("renders invalid release id state", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={Number.NaN} />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(t("recordDetail.invalidMessage"))).toBeTruthy();
  });

  it("renders API errors with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Release not found" }, 404));
    renderWithProviders(<RecordDetailScreen releaseId={404} />);

    expect(await screen.findByText("Release not found")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
