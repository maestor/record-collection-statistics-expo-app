import type { components, paths } from "./generated/record-collection-api";

type JsonResponse<Response> = Response extends {
  content: { "application/json": infer Body };
}
  ? Body
  : never;

export type ApiIndex = JsonResponse<paths["/"]["get"]["responses"]["200"]>;
export type Health = JsonResponse<paths["/health"]["get"]["responses"]["200"]>;
export type DashboardResponse = JsonResponse<paths["/stats/dashboard"]["get"]["responses"]["200"]>;
export type DashboardStats = DashboardResponse["data"];
export type FilterCatalogResponse = JsonResponse<paths["/filters"]["get"]["responses"]["200"]>;
export type FilterCatalog = FilterCatalogResponse["data"];
export type FilterDimension = NonNullable<
  NonNullable<paths["/filters"]["get"]["parameters"]["query"]>["dimensions"]
>[number];
export type RecordsResponse = JsonResponse<paths["/records"]["get"]["responses"]["200"]>;
export type RecordListParams = NonNullable<paths["/records"]["get"]["parameters"]["query"]>;
export type RecordListItem = components["schemas"]["RecordListItem"];
export type RecordDetailResponse = JsonResponse<paths["/records/{releaseId}"]["get"]["responses"]["200"]>;
export type RecordDetail = RecordDetailResponse["data"];
export type BreakdownResponse = JsonResponse<
  paths["/stats/breakdowns/{dimension}"]["get"]["responses"]["200"]
>;
export type BreakdownDimension =
  paths["/stats/breakdowns/{dimension}"]["get"]["parameters"]["path"]["dimension"];
export type BreakdownItem = components["schemas"]["BreakdownItem"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
