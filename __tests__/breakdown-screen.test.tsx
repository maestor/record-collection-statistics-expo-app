import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { BreakdownScreen } from "@/features/dashboard/breakdown-screen";
import { jsonResponse, renderWithProviders, t } from "../test/test-utils";

const rockBreakdownPayload = {
  data: [
    { itemCount: 2022, releaseCount: 2021, value: "Rock" },
    { itemCount: 585, releaseCount: 585, value: "Pop Rock" },
  ],
  meta: {
    dimension: "genre",
    total: 2,
  },
};

describe("BreakdownScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn(async () => jsonResponse(rockBreakdownPayload));
  });

  it("renders a loading state while the breakdown is being fetched", async () => {
    let resolveBreakdownResponse: ((response: Response) => void) | undefined;

    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveBreakdownResponse = resolve;
        }),
    );

    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(screen.getByText(t("breakdowns.loadingTitle"))).toBeTruthy();
    expect(screen.getByText(t("breakdowns.loadingMessage"))).toBeTruthy();
    expect(screen.queryByText("Rock")).toBeNull();

    resolveBreakdownResponse?.(jsonResponse(rockBreakdownPayload));

    expect(await screen.findByText("Rock")).toBeTruthy();
  });

  it("renders the requested breakdown values", async () => {
    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByText(t("dimensions.genre"))).toBeTruthy();
    expect(screen.getByText("Rock")).toBeTruthy();
    expect(screen.getByText("Pop Rock")).toBeTruthy();
    expect((globalThis.fetch as jest.Mock).mock.calls[0]?.[0]).toContain("/stats/breakdowns/genre");
  });

  it("renders an empty state when the breakdown has no values", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ ...rockBreakdownPayload, data: [] }));

    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByText(t("dimensions.genre"))).toBeTruthy();
    expect(screen.getByText(t("common.noValuesYet"))).toBeTruthy();
  });

  it("renders API errors with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "No breakdown data" }, 503));

    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("No breakdown data")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
