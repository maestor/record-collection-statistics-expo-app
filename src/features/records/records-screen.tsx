import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useFiltersQuery, useRecordsQuery } from "@/api/queries";
import type { RecordListParams } from "@/api/types";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/button";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation, translate } from "@/localization/i18n";
import { colors, radius } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { assertNever } from "@/utils/assert-never";
import { formatCount } from "@/utils/format";
import { RecordCard } from "./record-card";

type SortValue = "artist" | "date_added" | "release_year" | "title";
type OrderValue = NonNullable<RecordListParams["order"]>;
type FilterKey = "artist" | "country" | "format" | "genre";

const sortOptions: SortValue[] = ["date_added", "release_year", "artist", "title"];
const orderOptions: OrderValue[] = ["desc", "asc"];

function labelForSort(sort: SortValue): string {
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
}

function buildParams(
  query: string,
  sort: SortValue,
  order: OrderValue,
  selectedFilters: Partial<Record<FilterKey, string>>,
): Omit<RecordListParams, "page"> {
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
}

export function RecordsScreen() {
  const { t } = useTranslation();
  const [draftQuery, setDraftQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortValue>("date_added");
  const [order, setOrder] = React.useState<OrderValue>("desc");
  const [selectedFilters, setSelectedFilters] = React.useState<Partial<Record<FilterKey, string>>>({});
  const params = React.useMemo(
    () => buildParams(query, sort, order, selectedFilters),
    [order, query, selectedFilters, sort],
  );
  const recordsQuery = useRecordsQuery(params);
  const filtersQuery = useFiltersQuery(10);
  const records = recordsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = recordsQuery.data?.pages[0];
  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length + (query ? 1 : 0);

  function setFilter(key: FilterKey, value: string) {
    setSelectedFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  function clearFilters() {
    setDraftQuery("");
    setQuery("");
    setSelectedFilters({});
    setSort("date_added");
    setOrder("desc");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.lg }}
    >
      <Section title={t("records.searchTitle")}>
        <View style={{ gap: spacing.md }}>
          <TextInput
            accessibilityLabel={t("records.searchLabel")}
            autoCapitalize="none"
            onChangeText={setDraftQuery}
            onSubmitEditing={() => setQuery(draftQuery)}
            placeholder={t("records.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              borderWidth: 1,
              color: colors.text,
              fontSize: 16,
              minHeight: 52,
              paddingHorizontal: spacing.md,
            }}
            value={draftQuery}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Button label={t("records.searchButton")} onPress={() => setQuery(draftQuery)} style={{ flexGrow: 1 }} />
            <Button
              label={`${t("records.filtersButton")}${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
              onPress={() => setFiltersOpen((value) => !value)}
              style={{ flexGrow: 1 }}
              variant="secondary"
            />
          </View>
        </View>
      </Section>

      {filtersOpen && (
        <FilterPanel
          clearFilters={clearFilters}
          filters={filtersQuery.data?.data}
          isLoading={filtersQuery.isLoading}
          order={order}
          selectedFilters={selectedFilters}
          setFilter={setFilter}
          setOrder={setOrder}
          setSort={setSort}
          sort={sort}
        />
      )}

      {recordsQuery.isLoading && (
        <StatusMessage
          message={t("records.loadingMessage")}
          title={t("records.loadingTitle")}
          tone="loading"
        />
      )}

      {recordsQuery.isError && (
        <StatusMessage
          actionLabel={t("common.tryAgain")}
          message={getErrorMessage(recordsQuery.error)}
          onAction={() => void recordsQuery.refetch()}
          title={t("records.errorTitle")}
          tone="error"
        />
      )}

      {firstPage && (
        <Section title={t("records.resultsTitle", { count: formatCount(firstPage.meta.total) })}>
          <View style={{ gap: spacing.md }}>
            {records.length === 0 ? (
              <StatusMessage
                message={t("records.emptyMessage")}
                title={t("records.emptyTitle")}
              />
            ) : (
              records.map((record) => <RecordCard key={record.releaseId} record={record} />)
            )}
          </View>
          {recordsQuery.hasNextPage && (
            <Button
              isLoading={recordsQuery.isFetchingNextPage}
              label={t("records.loadMore")}
              onPress={() => void recordsQuery.fetchNextPage()}
              variant="secondary"
            />
          )}
        </Section>
      )}
    </ScrollView>
  );
}

type FilterPanelProps = {
  clearFilters: () => void;
  filters: ReturnType<typeof useFiltersQuery>["data"] extends infer Result
    ? Result extends { data: infer Data }
      ? Data
      : undefined
    : undefined;
  isLoading: boolean;
  order: OrderValue;
  selectedFilters: Partial<Record<FilterKey, string>>;
  setFilter: (key: FilterKey, value: string) => void;
  setOrder: (order: OrderValue) => void;
  setSort: (sort: SortValue) => void;
  sort: SortValue;
};

function FilterPanel({
  clearFilters,
  filters,
  isLoading,
  order,
  selectedFilters,
  setFilter,
  setOrder,
  setSort,
  sort,
}: FilterPanelProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t("records.filterPanelLabel")}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.lg,
        padding: spacing.lg,
      }}
    >
      <ChipGroup
        label={t("records.sortBy")}
        options={sortOptions.map((value) => ({ label: labelForSort(value), value }))}
        selected={sort}
        onSelect={(value) => setSort(value as SortValue)}
      />
      <ChipGroup
        label={t("records.order")}
        options={orderOptions.map((value) => ({
          label: value === "desc" ? t("records.orderDescending") : t("records.orderAscending"),
          value,
        }))}
        selected={order}
        onSelect={(value) => setOrder(value as OrderValue)}
      />
      {isLoading && (
        <Text selectable style={{ color: colors.textMuted }}>
          {t("records.loadingFilters")}
        </Text>
      )}
      {filters && (
        <>
          <ChipGroup
            label={t("records.filterFormats")}
            options={filters.formats.map((item) => ({ label: item.value, value: item.value }))}
            selected={selectedFilters.format ?? ""}
            onSelect={(value) => setFilter("format", value)}
          />
          <ChipGroup
            label={t("records.filterGenres")}
            options={filters.genres.map((item) => ({ label: item.value, value: item.value }))}
            selected={selectedFilters.genre ?? ""}
            onSelect={(value) => setFilter("genre", value)}
          />
          <ChipGroup
            label={t("records.filterCountries")}
            options={filters.countries.map((item) => ({ label: item.value, value: item.value }))}
            selected={selectedFilters.country ?? ""}
            onSelect={(value) => setFilter("country", value)}
          />
          <ChipGroup
            label={t("records.filterArtists")}
            options={filters.artists.map((item) => ({ label: item.value, value: item.value }))}
            selected={selectedFilters.artist ?? ""}
            onSelect={(value) => setFilter("artist", value)}
          />
        </>
      )}
      <Button label={t("records.clearFilters")} onPress={clearFilters} variant="secondary" />
    </View>
  );
}

function ChipGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  selected: string;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={{
                backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                borderColor: isSelected ? colors.primary : colors.border,
                borderRadius: radius.md,
                borderWidth: 1,
                minHeight: 40,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Text style={{ color: isSelected ? colors.surface : colors.text, fontWeight: "700" }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
