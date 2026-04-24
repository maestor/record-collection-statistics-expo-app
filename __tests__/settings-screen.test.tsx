import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { SettingsScreen } from "@/features/settings/settings-screen";
import { jsonResponse, renderWithProviders, resetSecureStore } from "../test/test-utils";

describe("SettingsScreen", () => {
  beforeEach(() => {
    resetSecureStore();
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        database: {
          lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
          releaseCount: 2345,
          totalItems: 2346,
        },
        ok: true,
      }),
    );
  });

  it("saves settings and tests the configured connection", async () => {
    renderWithProviders(<SettingsScreen />);

    const baseUrlInput = await screen.findByLabelText("API base URL");
    fireEvent.changeText(baseUrlInput, "http://10.0.2.2:3003");
    fireEvent.changeText(screen.getByLabelText("API key"), "read-key");
    fireEvent.press(screen.getByRole("button", { name: "Save settings" }));

    await screen.findByText("Settings saved.");
    fireEvent.press(screen.getByRole("button", { name: "Test connection" }));

    await screen.findByText(/Connected\. Local cache has 2345 releases/);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const headers = (globalThis.fetch as jest.Mock).mock.calls[0][1].headers as Headers;
    expect(headers.get("x-api-key")).toBe("read-key");
    expect(screen.queryByText("read-key")).toBeNull();
  });

  it("shows connection errors accessibly", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Missing API key" }, 401));
    renderWithProviders(<SettingsScreen />);

    await screen.findByLabelText("API base URL");
    fireEvent.press(screen.getByRole("button", { name: "Test connection" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("Missing API key")).toBeTruthy();
  });
});
