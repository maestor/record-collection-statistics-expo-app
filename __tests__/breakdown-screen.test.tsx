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

    expect(screen.getByText(t("breakdowns.loadingTitle"))).toBeOnTheScreen();
    expect(screen.getByText(t("breakdowns.loadingMessage"))).toBeOnTheScreen();
    expect(screen.queryByText("Rock")).not.toBeOnTheScreen();

    resolveBreakdownResponse?.(jsonResponse(rockBreakdownPayload));

    expect(await screen.findByText("Rock")).toBeOnTheScreen();
  });

  it("renders the requested breakdown values", async () => {
    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByText(t("dimensions.genre"))).toBeOnTheScreen();
    expect(screen.getByText("Rock")).toBeOnTheScreen();
    expect(screen.getByText("Pop Rock")).toBeOnTheScreen();
    expect((globalThis.fetch as jest.Mock).mock.calls[0]?.[0]).toContain("/stats/breakdowns/genre");
  });

  it("renders an empty state when the breakdown has no values", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ ...rockBreakdownPayload, data: [] }));

    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByText(t("dimensions.genre"))).toBeOnTheScreen();
    expect(screen.getByText(t("common.noValuesYet"))).toBeOnTheScreen();
  });

  it("renders API errors with retry", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "No breakdown data" }, 503));

    renderWithProviders(<BreakdownScreen dimension="genre" />);

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(screen.getByText("No breakdown data")).toBeOnTheScreen();

    fireEvent.press(screen.getByRole("button", { name: t("common.tryAgain") }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
