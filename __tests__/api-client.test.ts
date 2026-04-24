import { getHealth, listRecords } from "@/api/client";
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

  it("serializes record query params and omits empty values", async () => {
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

  it("handles abort errors when DOMException is unavailable", async () => {
    const originalDomException = globalThis.DOMException;
    Object.defineProperty(globalThis, "DOMException", {
      configurable: true,
      value: undefined,
    });
    globalThis.fetch = jest.fn(async () => {
      throw { name: "AbortError" };
    });

    await expect(getHealth({ apiKey: "", baseUrl: "http://example.test" })).rejects.toThrow(
      "Request timed out",
    );

    Object.defineProperty(globalThis, "DOMException", {
      configurable: true,
      value: originalDomException,
    });
  });
});
