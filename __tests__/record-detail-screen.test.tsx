import * as React from "react";
import { fireEvent, screen } from "@testing-library/react-native";

import * as apiQueries from "@/api/queries";
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
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(async () => jsonResponse({ data: recordDetail }));
  });

  it("renders a loading state before record detail data arrives", async () => {
    let resolveRecordResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRecordResponse = resolve;
        }),
    );

    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(screen.getByText(t("recordDetail.loadingTitle"))).toBeOnTheScreen();
    expect(screen.getByText(t("recordDetail.loadingMessage"))).toBeOnTheScreen();

    resolveRecordResponse?.(jsonResponse({ data: recordDetail }));

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
  });

  it("keeps the loading state when detail data has not restored yet", () => {
    jest.spyOn(apiQueries, "useRecordDetailQuery").mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof apiQueries.useRecordDetailQuery>);

    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(screen.getByText(t("recordDetail.loadingTitle"))).toBeOnTheScreen();
    expect(screen.getByText(t("recordDetail.loadingMessage"))).toBeOnTheScreen();
  });

  it("renders record metadata in card sections with compact tracks", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    expect(screen.getByText("Muse")).toBeOnTheScreen();
    expect(screen.getByText(t("recordDetail.labels"))).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Warner Records · 5026854087467\nWarner Records · 9362499549\nMushroom Pillow · Ei kataloginumeroa",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText("Vinyl, 12\", EP, Limited edition")).toBeOnTheScreen();
    expect(screen.getAllByText("18.4.2026")).toHaveLength(2);
    expect(screen.getByText(t("recordDetail.collectionAddedOn"))).toBeOnTheScreen();
    expect(screen.queryByText(t("recordDetail.collection"))).not.toBeOnTheScreen();
    expect(screen.queryAllByText(t("recordDetail.labels"))).toHaveLength(1);
    expect(screen.getAllByText("Barcode")).toHaveLength(1);
    expect(screen.getByText("5026854087467 · Text\n5026854087468")).toBeOnTheScreen();
    expect(screen.getByText("LC01234")).toBeOnTheScreen();
    expect(screen.getByText("A2 • Sober")).toBeOnTheScreen();
  });

  it("renders fallback detail values without empty track or identifier sections", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        data: {
          ...recordDetail,
          artistsSort: null,
          country: null,
          coverImage: null,
          dateAdded: null,
          genres: [],
          identifiers: [],
          labels: [{ catno: null, labelId: 1, name: "Unknown Label", position: 0 }],
          released: null,
          styles: [],
          tracks: [],
        },
      }),
    );

    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("Muscle Museum EP")).toBeOnTheScreen();
    expect(screen.getByText(t("common.unknownArtist"))).toBeOnTheScreen();
    expect(screen.getAllByText(t("common.unknown")).length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("Unknown Label · Ei kataloginumeroa")).toBeOnTheScreen();
    expect(screen.queryByText(t("recordDetail.trackList"))).not.toBeOnTheScreen();
    expect(screen.queryByText(t("recordDetail.identifiers"))).not.toBeOnTheScreen();
  });

  it("renders track durations when the API provides them", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        data: {
          ...recordDetail,
          tracks: [{ duration: "3:12", position: "A1", title: "Muscle Museum", type: "track" }],
        },
      }),
    );

    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("A1 • Muscle Museum • 3:12")).toBeOnTheScreen();
  });

  it("falls back to the track index when the position is missing", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        data: {
          ...recordDetail,
          tracks: [{ duration: "", position: null, title: "Hidden Track", type: "track" }],
        },
      }),
    );

    renderWithProviders(<RecordDetailScreen releaseId={37098591} />);

    expect(await screen.findByText("1 • Hidden Track")).toBeOnTheScreen();
  });

  it("renders invalid release id state", async () => {
    renderWithProviders(<RecordDetailScreen releaseId={Number.NaN} />);

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(screen.getByText(t("recordDetail.invalidMessage"))).toBeOnTheScreen();
  });

  it("renders API errors with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Release not found" }, 404));
    renderWithProviders(<RecordDetailScreen releaseId={404} />);

    expect(await screen.findByText("Release not found")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
