import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import {
  AppProviders,
  createQueryClient,
  DEFAULT_QUERY_STALE_TIME,
  QUERY_CACHE_MAX_AGE,
} from "@/providers/app-providers";

describe("AppProviders", () => {
  it("creates a query client with longer-lived cache defaults", () => {
    const queryClient = createQueryClient();
    const defaultQueries = queryClient.getDefaultOptions().queries;

    expect(defaultQueries?.gcTime).toBe(QUERY_CACHE_MAX_AGE);
    expect(defaultQueries?.refetchOnReconnect).toBe(true);
    expect(defaultQueries?.retry).toBe(1);
    expect(defaultQueries?.staleTime).toBe(DEFAULT_QUERY_STALE_TIME);
  });

  it("renders with persistent query caching enabled", async () => {
    render(
      <AppProviders client={new QueryClient()}>
        <Text>ready</Text>
      </AppProviders>,
    );

    expect(screen.getByText("ready")).toBeOnTheScreen();
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
});
