import type {
  BreakdownDimension,
  BreakdownResponse,
  DashboardResponse,
  FilterDimension,
  FilterCatalogResponse,
  Health,
  RecordDetailResponse,
  RecordListParams,
  RecordsResponse,
} from "./types";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const ANDROID_EMULATOR_API_BASE_URL = "http://10.0.2.2:3003";
export const IOS_SIMULATOR_API_BASE_URL = "http://127.0.0.1:3003";

type AppExtra = {
  recordCollectionApiKey?: string;
  recordCollectionApiUrl?: string;
};

const appExtra = Constants.expoConfig!.extra as AppExtra;

export const getLocalApiBaseUrl = (): string =>
  Platform.OS === "android"
    ? ANDROID_EMULATOR_API_BASE_URL
    : IOS_SIMULATOR_API_BASE_URL;

const getDefaultApiBaseUrl = (): string =>
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  appExtra.recordCollectionApiUrl?.trim() ||
  getLocalApiBaseUrl();

export const DEFAULT_API_BASE_URL = getDefaultApiBaseUrl();
export const DEFAULT_API_KEY =
  process.env.EXPO_PUBLIC_API_KEY?.trim() ||
  appExtra.recordCollectionApiKey?.trim() ||
  "";

export type ApiConfig = {
  apiKey: string;
  baseUrl: string;
};

type QueryParamValue = number | string | string[];
type QueryParams = Record<string, QueryParamValue>;
type RequestOptions = {
  signal?: AbortSignal | undefined;
  useEtagCache?: boolean;
};
type CachedResponseEntry<T> = {
  etag: string;
  payload: T;
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

export const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.trim().replace(/\/+$/, "");

export const getApiConfig = (): ApiConfig => {
  return {
    apiKey: DEFAULT_API_KEY,
    baseUrl: DEFAULT_API_BASE_URL,
  };
};

export const getErrorMessage = (error: Error): string => error.message;

const responseCache = new Map<string, CachedResponseEntry<unknown>>();

const hasErrorName = (error: unknown, name: string): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === name
  );
};

const getHeaders = (config: ApiConfig): Headers => {
  const headers = new Headers({ Accept: "application/json" });
  const apiKey = config.apiKey.trim();

  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }

  return headers;
};

const getCachedResponse = <T>(cacheKey: string): CachedResponseEntry<T> | undefined =>
  responseCache.get(cacheKey) as CachedResponseEntry<T> | undefined;

const setCachedResponse = <T>(
  cacheKey: string,
  etag: string,
  payload: T,
): void => {
  responseCache.set(cacheKey, { etag, payload });
};

const buildUrl = (
  config: ApiConfig,
  path: string,
  params: QueryParams = {},
): string => {
  const url = new URL(`${normalizeBaseUrl(config.baseUrl)}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(
      key,
      Array.isArray(value) ? value.join(",") : String(value),
    );
  }

  return url.toString();
};

const getNetworkErrorMessage = (config: ApiConfig): string => {
  const baseUrl = normalizeBaseUrl(config.baseUrl);

  return `Network request failed for ${baseUrl}. Use ${ANDROID_EMULATOR_API_BASE_URL} for the Android emulator, ${IOS_SIMULATOR_API_BASE_URL} for the iOS simulator, or http://<computer-lan-ip>:3003 for a physical phone.`;
};

const readError = async (response: Response): Promise<string> => {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" && payload.error
      ? payload.error
      : fallback;
  } catch {
    /* istanbul ignore next -- defensive fallback for non-JSON error responses */
    return fallback;
  }
};

const connectAbortSignal = (
  signal: AbortSignal | undefined,
  controller: AbortController,
): (() => void) => {
  if (!signal) {
    return () => undefined;
  }

  const abortRequest = () => controller.abort();

  if (signal.aborted) {
    abortRequest();
    return () => undefined;
  }

  signal.addEventListener("abort", abortRequest);

  return () => signal.removeEventListener("abort", abortRequest);
};

const requestJson = async <T>(
  config: ApiConfig,
  path: string,
  params: QueryParams | undefined,
  options: RequestOptions,
): Promise<T> => {
  const controller = new AbortController();
  let didTimeout = false;
  const disconnectAbortSignal = connectAbortSignal(options.signal, controller);
  const useEtagCache = options.useEtagCache ?? true;
  const timeout = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, 10_000);

  try {
    const requestUrl = buildUrl(config, path, params);
    const headers = getHeaders(config);
    const cachedResponse = getCachedResponse<T>(requestUrl);

    if (useEtagCache && cachedResponse) {
      headers.set("If-None-Match", cachedResponse.etag);
    }

    const response = await fetch(requestUrl, {
      headers,
      signal: controller.signal,
    });

    if (response.status === 304) {
      if (cachedResponse) {
        return cachedResponse.payload;
      }

      responseCache.delete(requestUrl);
      return requestJson(config, path, params, {
        ...options,
        useEtagCache: false,
      });
    }

    if (!response.ok) {
      throw new ApiError(await readError(response), response.status);
    }

    const payload = (await response.json()) as T;
    const etag = response.headers.get("ETag");

    if (etag) {
      setCachedResponse(requestUrl, etag, payload);
    } else {
      responseCache.delete(requestUrl);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (hasErrorName(error, "AbortError")) {
      if (didTimeout) {
        throw new ApiError("Request timed out", 0);
      }

      throw error;
    }

    throw new ApiError(getNetworkErrorMessage(config), 0);
  } finally {
    clearTimeout(timeout);
    disconnectAbortSignal();
  }
};

export const getHealth = (
  config: ApiConfig,
  signal?: AbortSignal,
): Promise<Health> => requestJson<Health>(config, "/health", undefined, { signal });

export const getDashboardStats = (
  config: ApiConfig,
  limit: number,
  signal?: AbortSignal,
): Promise<DashboardResponse> =>
  requestJson<DashboardResponse>(config, "/stats/dashboard", { limit }, { signal });

export const getFilters = (
  config: ApiConfig,
  limit: number,
  dimensions: FilterDimension[],
  signal?: AbortSignal,
): Promise<FilterCatalogResponse> =>
  requestJson<FilterCatalogResponse>(config, "/filters", { dimensions, limit }, { signal });

export const listRecords = (
  config: ApiConfig,
  params: RecordListParams,
  signal?: AbortSignal,
): Promise<RecordsResponse> =>
  requestJson<RecordsResponse>(config, "/records", params as QueryParams, {
    signal,
  });

export const getRecordDetail = (
  config: ApiConfig,
  releaseId: number,
  signal?: AbortSignal,
): Promise<RecordDetailResponse> =>
  requestJson<RecordDetailResponse>(config, `/records/${releaseId}`, undefined, {
    signal,
  });

export const getBreakdown = (
  config: ApiConfig,
  dimension: BreakdownDimension,
  signal?: AbortSignal,
): Promise<BreakdownResponse> =>
  requestJson<BreakdownResponse>(config, `/stats/breakdowns/${dimension}`, undefined, {
    signal,
  });
