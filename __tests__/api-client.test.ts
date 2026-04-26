import {
  ANDROID_EMULATOR_API_BASE_URL,
  getHealth,
  listRecords,
} from "@/api/client";
import { jsonResponse } from "../test/test-utils";

describe("api client", () => {
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

  it("explains loopback network failures for Android", async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError("Network request failed");
    });

    await expect(
      getHealth({ apiKey: "", baseUrl: "http://127.0.0.1:3003" }),
    ).rejects.toThrow(`Use ${ANDROID_EMULATOR_API_BASE_URL} for the emulator`);
  });
});
