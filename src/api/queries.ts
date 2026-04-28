import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getBreakdown,
  getDashboardStats,
  getFilters,
  getHealth,
  getApiConfig,
  getRecordDetail,
  getRandomRecord,
  listRecords,
} from "./client";
import type {
  BreakdownDimension,
  FilterDimension,
  RecordListParams,
  RandomRecordParams,
  RecordsResponse,
} from "./types";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const HEALTH_STALE_TIME = 5 * MINUTE_MS;
const DASHBOARD_STALE_TIME = HOUR_MS;
const FILTERS_STALE_TIME = DAY_MS;
const RECORDS_STALE_TIME = 15 * MINUTE_MS;
const DETAIL_STALE_TIME = DAY_MS;
const BREAKDOWN_STALE_TIME = DAY_MS;
const recordFilterDimensions: FilterDimension[] = [
  "artist",
  "format",
  "genre",
  "added_year",
];

const apiConfig = getApiConfig();

const useApiQueryBase = () => {
  return {
    queryScope: [apiConfig.baseUrl] as const,
    config: apiConfig,
    enabled: true,
  };
};

export const useHealthQuery = () => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: ({ signal }) => getHealth(config, signal),
    queryKey: ["health", ...queryScope],
    staleTime: HEALTH_STALE_TIME,
  });
};

export const useDashboardStatsQuery = (limit: number) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: ({ signal }) => getDashboardStats(config, limit, signal),
    queryKey: ["dashboard", ...queryScope, limit],
    staleTime: DASHBOARD_STALE_TIME,
  });
};

export const useFiltersQuery = (limit: number, enabled: boolean) => {
  const { config, enabled: queryBaseEnabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled: enabled && queryBaseEnabled,
    queryFn: ({ signal }) =>
      getFilters(config, limit, recordFilterDimensions, signal),
    queryKey: ["filters", ...queryScope, limit, recordFilterDimensions],
    staleTime: FILTERS_STALE_TIME,
  });
};

export const useRecordsQuery = (params: Omit<RecordListParams, "page">) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useInfiniteQuery<RecordsResponse>({
    enabled,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.meta.page + 1;
      return nextPage <= lastPage.meta.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listRecords(
        config,
        {
          ...params,
          page: pageParam as number,
        },
        signal,
      ),
    queryKey: ["records", ...queryScope, params],
    staleTime: RECORDS_STALE_TIME,
  });
};

export const useRecordDetailQuery = (releaseId: number) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled: enabled && Number.isFinite(releaseId),
    queryFn: ({ signal }) => getRecordDetail(config, releaseId, signal),
    queryKey: ["record-detail", ...queryScope, releaseId],
    staleTime: DETAIL_STALE_TIME,
  });
};

export const useRandomRecordDetailQuery = (params: RandomRecordParams = {}) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    gcTime: 0,
    enabled,
    queryFn: ({ signal }) => getRandomRecord(config, params, signal),
    queryKey: ["random-record-detail", ...queryScope, params],
    refetchOnMount: "always",
    staleTime: 0,
  });
};

export const useBreakdownQuery = (dimension: BreakdownDimension) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: ({ signal }) => getBreakdown(config, dimension, signal),
    queryKey: ["breakdown", ...queryScope, dimension],
    staleTime: BREAKDOWN_STALE_TIME,
  });
};
