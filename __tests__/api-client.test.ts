import {
  ANDROID_EMULATOR_API_BASE_URL,
  getFilters,
  getHealth,
  getLocalApiBaseUrl,
  getRandomRecord,
  IOS_SIMULATOR_API_BASE_URL,
  listRecords,
} from "@/api/client";
import { Platform } from "react-native";
import { jsonResponse } from "../test/test-utils";

describe("api client", () => {
  const originalPlatformOs = Platform.OS;

  beforeEach(() => {
    jest.useRealTimers();
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        database: {
          lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
          releaseCount: 2,
          totalItems: 2,
        },
        ok: true,
      }),
    );
  });

  afterAll(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatformOs,
    });
  });

  it("uses the Android emulator loopback by default on Android", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });

    expect(getLocalApiBaseUrl()).toBe(ANDROID_EMULATOR_API_BASE_URL);
  });

  it("uses localhost loopback by default on iOS", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "ios",
    });

    expect(getLocalApiBaseUrl()).toBe(IOS_SIMULATOR_API_BASE_URL);
  });

  it("sends an API key only when configured", async () => {
    await getHealth({ apiKey: "secret-key", baseUrl: "http://example.test/" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://example.test/health",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = (globalThis.fetch as jest.Mock).mock.calls[0][1].headers as Headers;
    expect(headers.get("x-api-key")).toBe("secret-key");
  });

  it("serializes record query params without leaking the API key", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse({
        data: [],
        filters: {
          addedFrom: null,
          addedTo: null,
          artist: "Muse",
          country: null,
          format: null,
          genre: null,
          label: null,
          order: "desc",
          q: "museum",
          sort: "artist",
          style: null,
          yearFrom: null,
          yearTo: null,
        },
        meta: {
          page: 1,
          pageSize: 25,
          total: 0,
          totalPages: 0,
        },
      }),
    );

    await listRecords(
      { apiKey: "", baseUrl: "http://example.test" },
      {
        artist: "Muse",
        order: "desc",
        page: 1,
        page_size: 25,
        q: "museum",
        sort: "artist",
      },
    );

    const url = String((globalThis.fetch as jest.Mock).mock.calls[0][0]);
    expect(url).toContain("artist=Muse");
    expect(url).toContain("q=museum");
    expect(url).toContain("page_size=25");
    expect(url).not.toContain("apiKey");
  });

  it("serializes filter dimensions into the filters request", async () => {
    await getFilters(
      { apiKey: "", baseUrl: "http://example.test" },
      10,
      ["artist", "format", "genre", "added_year"],
    );

    const url = String((globalThis.fetch as jest.Mock).mock.calls[0][0]);
    expect(url).toContain("limit=10");
    expect(url).toContain("dimensions=artist%2Cformat%2Cgenre%2Cadded_year");
  });

  it("requests a random record detail from the dedicated endpoint", async () => {
    await getRandomRecord({ apiKey: "", baseUrl: "http://example.test" });
    await getRandomRecord(
      { apiKey: "", baseUrl: "http://example.test" },
      { format: "Vinyl", q: "Muse" },
    );

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      "http://example.test/records/random",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      "http://example.test/records/random?format=Vinyl&q=Muse",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it("normalizes API errors", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({ error: "Nope" }, 401));

    await expect(getHealth({ apiKey: "", baseUrl: "http://example.test" })).rejects.toThrow(
      "Nope",
    );
  });

  it("falls back to the status when an API error body has no message", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse({}, 503));

    await expect(getHealth({ apiKey: "", baseUrl: "http://example.test" })).rejects.toThrow(
      "Request failed with status 503",
    );
  });

  it("handles timeout abort errors when DOMException is unavailable", async () => {
    const originalDomException = globalThis.DOMException;
    jest.useFakeTimers();
    Object.defineProperty(globalThis, "DOMException", {
      configurable: true,
      value: undefined,
    });
    globalThis.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject({ name: "AbortError" });
          });
        }),
    );

    try {
      const request = getHealth({ apiKey: "", baseUrl: "http://example.test" });

      jest.advanceTimersByTime(10_000);

      await expect(request).rejects.toThrow("Request timed out");
    } finally {
      Object.defineProperty(globalThis, "DOMException", {
        configurable: true,
        value: originalDomException,
      });
      jest.useRealTimers();
    }
  });

  it("times out requests that do not complete", async () => {
    jest.useFakeTimers();
    globalThis.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject({ name: "AbortError" });
          });
        }),
    );

    const request = getHealth({ apiKey: "", baseUrl: "http://example.test" });

    jest.advanceTimersByTime(10_000);

    await expect(request).rejects.toThrow("Request timed out");
  });

  it("cancels requests when an external signal aborts", async () => {
    globalThis.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject({ name: "AbortError" });
          });
        }),
    );
    const controller = new AbortController();
    const request = getHealth(
      { apiKey: "", baseUrl: "http://example.test" },
      controller.signal,
    );

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://example.test/health",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("aborts immediately when the external signal is already aborted", async () => {
    globalThis.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject({ name: "AbortError" });
            return;
          }

          init?.signal?.addEventListener("abort", () => {
            reject({ name: "AbortError" });
          });
        }),
    );
    const controller = new AbortController();

    controller.abort();

    await expect(
      getHealth({ apiKey: "", baseUrl: "http://example.test" }, controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("reuses a cached payload when the API responds with 304", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            database: {
              lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
              releaseCount: 2,
              totalItems: 2,
            },
            ok: true,
          },
          200,
          { ETag: '"collection-123"' },
        ),
      )
      .mockResolvedValueOnce(jsonResponse({}, 304));

    const firstResponse = await getHealth({
      apiKey: "",
      baseUrl: "http://etag-cache.test",
    });
    const secondResponse = await getHealth({
      apiKey: "",
      baseUrl: "http://etag-cache.test",
    });

    expect(firstResponse).toEqual(secondResponse);
    const secondHeaders = (globalThis.fetch as jest.Mock).mock.calls[1][1]
      .headers as Headers;
    expect(secondHeaders.get("If-None-Match")).toBe('"collection-123"');
  });

  it("retries without If-None-Match if a 304 arrives without a cached payload", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 304))
      .mockResolvedValueOnce(
        jsonResponse({
          database: {
            lastSuccessfulSyncAt: "2026-04-23T17:34:05.883Z",
            releaseCount: 2,
            totalItems: 2,
          },
          ok: true,
        }),
      );

    const response = await getHealth({
      apiKey: "",
      baseUrl: "http://etag-retry.test",
    });

    expect(response.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const firstHeaders = (globalThis.fetch as jest.Mock).mock.calls[0][1]
      .headers as Headers;
    const secondHeaders = (globalThis.fetch as jest.Mock).mock.calls[1][1]
      .headers as Headers;
    expect(firstHeaders.get("If-None-Match")).toBeNull();
    expect(secondHeaders.get("If-None-Match")).toBeNull();
  });

  it("explains loopback network failures for local simulator and device setups", async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError("Network request failed");
    });

    await expect(
      getHealth({ apiKey: "", baseUrl: "http://127.0.0.1:3003" }),
    ).rejects.toThrow(
      `Use ${ANDROID_EMULATOR_API_BASE_URL} for the Android emulator, ${IOS_SIMULATOR_API_BASE_URL} for the iOS simulator`,
    );
  });
});
