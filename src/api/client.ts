import type {
  ApiIndex,
  BreakdownDimension,
  BreakdownResponse,
  DashboardResponse,
  FilterCatalogResponse,
  Health,
  RecordDetailResponse,
  RecordListParams,
  RecordsResponse,
} from "./types";

export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_DEFAULT_API_BASE_URL?.trim() || "http://127.0.0.1:3003";

export type ApiConfig = {
  apiKey: string;
  baseUrl: string;
};

type RequestOptions = {
  params?: Record<string, number | string | null | undefined>;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();

  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmed.replace(/\/+$/, "");
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

function hasErrorName(error: unknown, name: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === name
  );
}

function getHeaders(config: ApiConfig): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const apiKey = config.apiKey.trim();

  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }

  return headers;
}

function buildUrl(config: ApiConfig, path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${normalizeBaseUrl(config.baseUrl)}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function readError(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" && payload.error ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(
  config: ApiConfig,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(buildUrl(config, path, options.params), {
      headers: getHeaders(config),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(await readError(response), response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }

    if (hasErrorName(error, "AbortError")) {
      throw new ApiError("Request timed out", 0);
    }

    throw new ApiError("Network request failed", 0);
  } finally {
    clearTimeout(timeout);
  }
}

export function getApiIndex(config: ApiConfig): Promise<ApiIndex> {
  return requestJson<ApiIndex>(config, "/");
}

export function getHealth(config: ApiConfig): Promise<Health> {
  return requestJson<Health>(config, "/health");
}

export function getDashboardStats(config: ApiConfig, limit = 8): Promise<DashboardResponse> {
  return requestJson<DashboardResponse>(config, "/stats/dashboard", { params: { limit } });
}

export function getFilters(config: ApiConfig, limit = 50): Promise<FilterCatalogResponse> {
  return requestJson<FilterCatalogResponse>(config, "/filters", { params: { limit } });
}

export function listRecords(config: ApiConfig, params: RecordListParams): Promise<RecordsResponse> {
  return requestJson<RecordsResponse>(config, "/records", {
    params: params as Record<string, number | string | null | undefined>,
  });
}

export function getRecordDetail(
  config: ApiConfig,
  releaseId: number,
): Promise<RecordDetailResponse> {
  return requestJson<RecordDetailResponse>(config, `/records/${releaseId}`);
}

export function getBreakdown(
  config: ApiConfig,
  dimension: BreakdownDimension,
): Promise<BreakdownResponse> {
  return requestJson<BreakdownResponse>(config, `/stats/breakdowns/${dimension}`);
}
