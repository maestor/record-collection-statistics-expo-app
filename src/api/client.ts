import type {
  BreakdownDimension,
  BreakdownResponse,
  DashboardResponse,
  FilterCatalogResponse,
  Health,
  RecordDetailResponse,
  RecordListParams,
  RecordsResponse,
} from "./types";
import Constants from "expo-constants";

export const COMPUTER_API_BASE_URL = "http://127.0.0.1:3003";
export const ANDROID_EMULATOR_API_BASE_URL = "http://10.0.2.2:3003";

type AppExtra = {
  recordCollectionApiKey?: unknown;
  recordCollectionApiUrl?: unknown;
};

function getExtraValue(key: keyof AppExtra): string {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as AppExtra;
  const value = extra[key];

  return typeof value === "string" ? value.trim() : "";
}

function getDefaultApiBaseUrl(expoOs = process.env.EXPO_OS): string {
  return (
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    getExtraValue("recordCollectionApiUrl") ||
    process.env.EXPO_PUBLIC_DEFAULT_API_BASE_URL?.trim() ||
    (expoOs === "android" ? ANDROID_EMULATOR_API_BASE_URL : COMPUTER_API_BASE_URL)
  );
}

export const DEFAULT_API_BASE_URL = getDefaultApiBaseUrl();
export const DEFAULT_API_KEY =
  process.env.EXPO_PUBLIC_API_KEY?.trim() || getExtraValue("recordCollectionApiKey");

export type ApiConfig = {
  apiKey: string;
  baseUrl: string;
};

type RequestOptions = {
  params?: Record<string, number | string | null | undefined>;
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
  return baseUrl.trim().replace(/\/+$/, "");
}

export function getApiConfig(): ApiConfig {
  return {
    apiKey: DEFAULT_API_KEY,
    baseUrl: DEFAULT_API_BASE_URL,
  };
}

export function getErrorMessage(error: Error): string {
  return error.message;
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

function getNetworkErrorMessage(config: ApiConfig): string {
  const baseUrl = normalizeBaseUrl(config.baseUrl);

  if (baseUrl === COMPUTER_API_BASE_URL || baseUrl === "http://localhost:3003") {
    return `Network request failed for ${baseUrl}. On Android, localhost points to the device. Use ${ANDROID_EMULATOR_API_BASE_URL} for the emulator, or http://<computer-lan-ip>:3003 for a physical phone.`;
  }

  return `Network request failed for ${baseUrl}. Check that the API is reachable from this device. For a physical phone, use your computer LAN IP and make sure the API listens beyond localhost.`;
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
    if (error instanceof ApiError) {
      throw error;
    }

    if (hasErrorName(error, "AbortError")) {
      throw new ApiError("Request timed out", 0);
    }

    throw new ApiError(getNetworkErrorMessage(config), 0);
  } finally {
    clearTimeout(timeout);
  }
}

export function getHealth(config: ApiConfig): Promise<Health> {
  return requestJson<Health>(config, "/health");
}

export function getDashboardStats(config: ApiConfig, limit: number): Promise<DashboardResponse> {
  return requestJson<DashboardResponse>(config, "/stats/dashboard", { params: { limit } });
}

export function getFilters(config: ApiConfig, limit: number): Promise<FilterCatalogResponse> {
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
