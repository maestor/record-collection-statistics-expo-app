import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getBreakdown,
  getDashboardStats,
  getFilters,
  getHealth,
  getRecordDetail,
  listRecords,
} from "./client";
import type { BreakdownDimension, RecordListParams, RecordsResponse } from "./types";
import { useAppSettings } from "@/providers/settings-provider";

function useApiQueryBase() {
  const { isLoaded, revision, settings } = useAppSettings();

  return {
    enabled: isLoaded,
    queryScope: [settings.baseUrl, revision] as const,
    settings,
  };
}

export function useHealthQuery() {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getHealth(settings),
    queryKey: ["health", ...queryScope],
  });
}

export function useDashboardStatsQuery(limit = 8) {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getDashboardStats(settings, limit),
    queryKey: ["dashboard", ...queryScope, limit],
  });
}

export function useFiltersQuery(limit = 50) {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getFilters(settings, limit),
    queryKey: ["filters", ...queryScope, limit],
  });
}

export function useRecordsQuery(params: Omit<RecordListParams, "page">) {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useInfiniteQuery<RecordsResponse>({
    enabled,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.meta.page + 1;
      return nextPage <= lastPage.meta.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listRecords(settings, {
        ...params,
        page: typeof pageParam === "number" ? pageParam : 1,
      }),
    queryKey: ["records", ...queryScope, params],
  });
}

export function useRecordDetailQuery(releaseId: number) {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useQuery({
    enabled: enabled && Number.isFinite(releaseId),
    queryFn: () => getRecordDetail(settings, releaseId),
    queryKey: ["record-detail", ...queryScope, releaseId],
  });
}

export function useBreakdownQuery(dimension: BreakdownDimension) {
  const { enabled, queryScope, settings } = useApiQueryBase();

  return useQuery({
    enabled,
    queryFn: () => getBreakdown(settings, dimension),
    queryKey: ["breakdown", ...queryScope, dimension],
  });
}

