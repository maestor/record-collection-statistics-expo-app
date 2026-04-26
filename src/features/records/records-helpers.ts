import type { RecordDetail, RecordListItem, RecordListParams } from "@/api/types";
import { translate } from "@/localization/i18n";
import { assertNever } from "@/utils/assert-never";

export type SortValue = "artist" | "date_added" | "release_year" | "title";
export type OrderValue = NonNullable<RecordListParams["order"]>;
export type FilterKey = "artist" | "format" | "genre";
export type SelectedRecordFilters = Partial<Record<FilterKey, string>>;

export const filterKeys: FilterKey[] = ["artist", "format", "genre"];
export const sortOptions: SortValue[] = [
  "date_added",
  "release_year",
  "artist",
  "title",
];
export const orderOptions: OrderValue[] = ["desc", "asc"];

export const labelForSort = (sort: SortValue): string => {
  switch (sort) {
    case "date_added":
      return translate("records.sortDateAdded");
    case "release_year":
      return translate("records.sortReleaseYear");
    case "artist":
      return translate("records.sortArtist");
    case "title":
      return translate("records.sortTitle");
    /* istanbul ignore next -- exhaustive type guard for impossible union values */
    default:
      return assertNever(sort);
  }
};

export const buildRecordListParams = (
  query: string,
  sort: SortValue,
  order: OrderValue,
  selectedFilters: SelectedRecordFilters,
): Omit<RecordListParams, "page"> => {
  const params: Omit<RecordListParams, "page"> = {
    order,
    page_size: 25,
    sort,
  };
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    params.q = trimmedQuery;
  }

  for (const key of Object.keys(selectedFilters) as FilterKey[]) {
    const value = selectedFilters[key];

    if (value) {
      params[key] = value;
    }
  }

  return params;
};

export const normalizeSearchQuery = (value: string): string => value.trim();

export const haveDraftFiltersChanged = (
  sort: SortValue,
  draftSort: SortValue,
  order: OrderValue,
  draftOrder: OrderValue,
  selectedFilters: SelectedRecordFilters,
  draftSelectedFilters: SelectedRecordFilters,
): boolean => {
  if (sort !== draftSort || order !== draftOrder) {
    return true;
  }

  return filterKeys.some(
    (key) => selectedFilters[key] !== draftSelectedFilters[key],
  );
};

export const formatReleaseFormat = (
  format: Pick<RecordListItem["formats"][number], "descriptions" | "freeText" | "name">,
) => [format.name, ...format.descriptions, format.freeText].filter(Boolean).join(", ");

export const formatLabels = (
  labels: RecordDetail["labels"],
  emptyValue: string,
  unknownValue: string,
) =>
  labels.length === 0
    ? unknownValue
    : labels.map((label) => formatLabelValue(label, emptyValue)).join("\n");

export const formatTrack = (
  track: Pick<RecordDetail["tracks"][number], "duration" | "position" | "title">,
  index: number,
) => {
  const parts = [track.position ?? String(index + 1), track.title];

  if (track.duration) {
    parts.push(track.duration);
  }

  return parts.join(" • ");
};

export const groupIdentifiers = (identifiers: RecordDetail["identifiers"]) => {
  const grouped = new Map<string, string[]>();

  for (const identifier of identifiers) {
    const values = grouped.get(identifier.type);
    const formattedValue = formatIdentifierValue(identifier);

    if (values) {
      values.push(formattedValue);
    } else {
      grouped.set(identifier.type, [formattedValue]);
    }
  }

  return Array.from(grouped.entries());
};

const formatLabelValue = (
  label: Pick<RecordDetail["labels"][number], "catno" | "name">,
  emptyValue: string,
) => `${label.name} · ${label.catno ?? emptyValue}`;

const formatIdentifierValue = (
  identifier: Pick<RecordDetail["identifiers"][number], "description" | "value">,
) =>
  identifier.description
    ? `${identifier.value} · ${identifier.description}`
    : identifier.value;
