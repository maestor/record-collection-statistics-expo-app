import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getBreakdown,
  getDashboardStats,
  getFilters,
  getHealth,
  getApiConfig,
  getRecordDetail,
  listRecords,
} from "./client";
import type {
  BreakdownDimension,
  RecordListParams,
  RecordsResponse,
} from "./types";

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
    queryFn: () => getHealth(config),
    queryKey: ["health", ...queryScope],
  });
};

export const useDashboardStatsQuery = (limit: number) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getDashboardStats(config, limit),
    queryKey: ["dashboard", ...queryScope, limit],
  });
};

export const useFiltersQuery = (limit: number) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getFilters(config, limit),
    queryKey: ["filters", ...queryScope, limit],
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
    queryFn: ({ pageParam }) =>
      listRecords(config, {
        ...params,
        page: pageParam as number,
      }),
    queryKey: ["records", ...queryScope, params],
  });
};

export const useRecordDetailQuery = (releaseId: number) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled: enabled && Number.isFinite(releaseId),
    queryFn: () => getRecordDetail(config, releaseId),
    queryKey: ["record-detail", ...queryScope, releaseId],
  });
};

export const useBreakdownQuery = (dimension: BreakdownDimension) => {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getBreakdown(config, dimension),
    queryKey: ["breakdown", ...queryScope, dimension],
  });
};
