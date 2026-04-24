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
import type { BreakdownDimension, RecordListParams, RecordsResponse } from "./types";

const apiConfig = getApiConfig();

function useApiQueryBase() {
  return {
    enabled: true,
    queryScope: [apiConfig.baseUrl] as const,
    config: apiConfig,
  };
}

export function useHealthQuery() {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getHealth(config),
    queryKey: ["health", ...queryScope],
  });
}

export function useDashboardStatsQuery(limit = 8) {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getDashboardStats(config, limit),
    queryKey: ["dashboard", ...queryScope, limit],
  });
}

export function useFiltersQuery(limit = 50) {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getFilters(config, limit),
    queryKey: ["filters", ...queryScope, limit],
  });
}

export function useRecordsQuery(params: Omit<RecordListParams, "page">) {
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
        page: typeof pageParam === "number" ? pageParam : 1,
      }),
    queryKey: ["records", ...queryScope, params],
  });
}

export function useRecordDetailQuery(releaseId: number) {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled: enabled && Number.isFinite(releaseId),
    queryFn: () => getRecordDetail(config, releaseId),
    queryKey: ["record-detail", ...queryScope, releaseId],
  });
}

export function useBreakdownQuery(dimension: BreakdownDimension) {
  const { config, enabled, queryScope } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getBreakdown(config, dimension),
    queryKey: ["breakdown", ...queryScope, dimension],
  });
}
