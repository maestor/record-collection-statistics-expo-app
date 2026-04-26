import * as React from "react";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";

import { useFiltersQuery, useRecordsQuery } from "@/api/queries";
import type { RecordListParams } from "@/api/types";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Panel } from "@/components/panel";
import { SelectionTrigger } from "@/components/selection-trigger";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation, translate } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import {
  cardFrameStyle,
  screenStyles,
  sectionTitleStyle,
  wrapRowStyle,
} from "@/theme/styles";
import { assertNever } from "@/utils/assert-never";
import { formatCount } from "@/utils/format";
import { RecordCard } from "./record-card";

type SortValue = "artist" | "date_added" | "release_year" | "title";
type OrderValue = NonNullable<RecordListParams["order"]>;
type FilterKey = "artist" | "format" | "genre";

const sortOptions: SortValue[] = [
  "date_added",
  "release_year",
  "artist",
  "title",
];
const orderOptions: OrderValue[] = ["desc", "asc"];
const AUTO_SEARCH_DELAY_MS = 500;
const AUTO_SEARCH_MIN_LENGTH = 3;

const labelForSort = (sort: SortValue): string => {
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

const buildParams = (
  query: string,
  sort: SortValue,
  order: OrderValue,
  selectedFilters: Partial<Record<FilterKey, string>>,
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

const normalizeSearchQuery = (value: string): string => value.trim();

export const RecordsScreen = () => {
  const { t } = useTranslation();
  const [draftQuery, setDraftQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortValue>("date_added");
  const [order, setOrder] = React.useState<OrderValue>("desc");
  const [selectedFilters, setSelectedFilters] = React.useState<
    Partial<Record<FilterKey, string>>
  >({});
  const params = React.useMemo(
    () => buildParams(query, sort, order, selectedFilters),
    [order, query, selectedFilters, sort],
  );
  const recordsQuery = useRecordsQuery(params);
  const filtersQuery = useFiltersQuery(10, filtersOpen);
  const records = recordsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = recordsQuery.data?.pages[0];
  const activeFilterCount =
    Object.values(selectedFilters).filter(Boolean).length + (query ? 1 : 0);

  React.useEffect(() => {
    const normalizedDraftQuery = normalizeSearchQuery(draftQuery);

    if (normalizedDraftQuery === query) {
      return;
    }

    if (
      normalizedDraftQuery.length !== 0 &&
      normalizedDraftQuery.length < AUTO_SEARCH_MIN_LENGTH
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setQuery(normalizedDraftQuery);
    }, AUTO_SEARCH_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [draftQuery, query]);

  const setFilter = (key: FilterKey, value: string) => {
    setSelectedFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  };

  const applySearch = (nextQuery: string) => {
    const normalizedQuery = normalizeSearchQuery(nextQuery);
    setQuery(normalizedQuery);
  };

  const clearFilters = () => {
    setDraftQuery("");
    setQuery("");
    setSelectedFilters({});
    setSort("date_added");
    setOrder("desc");
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <Section title={t("records.searchTitle")}>
        <View style={{ gap: spacing.md }}>
          <TextInput
            accessibilityLabel={t("records.searchLabel")}
            autoCapitalize="none"
            onChangeText={setDraftQuery}
            onSubmitEditing={() => applySearch(draftQuery)}
            placeholder={t("records.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={[
              cardFrameStyle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontSize: 16,
                minHeight: 52,
                paddingHorizontal: spacing.md,
              },
            ]}
            value={draftQuery}
          />
          <SelectionTrigger
            accessibilityLabel={`${t("records.filtersButton")}${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
            actionLabel={t("records.selectFilters")}
            label={`${t("records.filtersButton")}${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
            onPress={() => setFiltersOpen(true)}
            style={{ width: "100%" }}
          />
        </View>
      </Section>

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

      <FilterSheet
        clearFilters={clearFilters}
        closeFilters={() => setFiltersOpen(false)}
        filters={filtersQuery.data?.data}
        isLoading={filtersQuery.isLoading}
        isOpen={filtersOpen}
        order={order}
        selectedFilters={selectedFilters}
        setFilter={setFilter}
        setOrder={setOrder}
        setSort={setSort}
        sort={sort}
      />

      {firstPage && (
        <Section
          title={t("records.resultsTitle", {
            count: formatCount(firstPage.meta.total),
          })}
        >
          <View style={{ gap: spacing.md }}>
            {records.length === 0 ? (
              <StatusMessage
                message={t("records.emptyMessage")}
                title={t("records.emptyTitle")}
              />
            ) : (
              records.map((record) => (
                <RecordCard key={record.releaseId} record={record} />
              ))
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
};

type FilterSheetProps = {
  clearFilters: () => void;
  closeFilters: () => void;
  filters: ReturnType<typeof useFiltersQuery>["data"] extends infer Result
    ? Result extends { data: infer Data }
      ? Data
      : undefined
    : undefined;
  isLoading: boolean;
  isOpen: boolean;
  order: OrderValue;
  selectedFilters: Partial<Record<FilterKey, string>>;
  setFilter: (key: FilterKey, value: string) => void;
  setOrder: (order: OrderValue) => void;
  setSort: (sort: SortValue) => void;
  sort: SortValue;
};

const FilterSheet = ({
  clearFilters,
  closeFilters,
  filters,
  isLoading,
  isOpen,
  order,
  selectedFilters,
  setFilter,
  setOrder,
  setSort,
  sort,
}: FilterSheetProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeFilters}
      transparent
      visible={isOpen}
    >
      <View
        style={{
          backgroundColor: "rgba(3, 31, 52, 0.72)",
          flex: 1,
          justifyContent: "center",
          padding: spacing.lg,
          paddingVertical: spacing.xl,
        }}
      >
        <Panel
          accessibilityLabel={t("records.filterPanelLabel")}
          backgroundColor={colors.surface}
          borderColor={colors.border}
          cornerRadius="lg"
          style={{ height: "100%", padding: spacing.lg }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.md,
              justifyContent: "space-between",
            }}
          >
            <Text style={[sectionTitleStyle, { flex: 1 }]}>
              {t("records.filtersButton")}
            </Text>
            <Button
              label={t("records.closeFilters")}
              onPress={closeFilters}
              variant="secondary"
            />
          </View>
          <View style={{ flex: 1, minHeight: 0 }}>
            <ScrollView
              contentContainerStyle={{
                gap: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
              }}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <FilterPanel
                filters={filters}
                isLoading={isLoading}
                order={order}
                selectedFilters={selectedFilters}
                setFilter={setFilter}
                setOrder={setOrder}
                setSort={setSort}
                sort={sort}
              />
            </ScrollView>
          </View>
          <View
            style={{
              borderTopColor: colors.border,
              borderTopWidth: 1,
              marginHorizontal: -spacing.lg,
              marginBottom: -spacing.lg,
              padding: spacing.lg,
            }}
          >
            <Button
              label={t("records.clearFilters")}
              onPress={clearFilters}
              style={{ width: "100%" }}
              variant="secondary"
            />
          </View>
        </Panel>
      </View>
    </Modal>
  );
};

type FilterPanelProps = Omit<
  FilterSheetProps,
  "clearFilters" | "closeFilters" | "isOpen"
>;

const FilterPanel = ({
  filters,
  isLoading,
  order,
  selectedFilters,
  setFilter,
  setOrder,
  setSort,
  sort,
}: FilterPanelProps) => {
  const { t } = useTranslation();

  return (
    <View style={{ gap: spacing.lg }}>
      <ChipGroup
        label={t("records.sortBy")}
        options={sortOptions.map((value) => ({
          label: labelForSort(value),
          value,
        }))}
        selected={sort}
        onSelect={(value) => setSort(value as SortValue)}
      />
      <ChipGroup
        label={t("records.order")}
        options={orderOptions.map((value) => ({
          label:
            value === "desc"
              ? t("records.orderDescending")
              : t("records.orderAscending"),
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
            options={filters.formats.map((item) => ({
              label: item.value,
              value: item.value,
            }))}
            selected={selectedFilters.format ?? ""}
            onSelect={(value) => setFilter("format", value)}
          />
          <ChipGroup
            label={t("records.filterArtists")}
            options={filters.artists.map((item) => ({
              label: item.value,
              value: item.value,
            }))}
            selected={selectedFilters.artist ?? ""}
            onSelect={(value) => setFilter("artist", value)}
          />
          <ChipGroup
            label={t("records.filterGenres")}
            options={filters.genres.map((item) => ({
              label: item.value,
              value: item.value,
            }))}
            selected={selectedFilters.genre ?? ""}
            onSelect={(value) => setFilter("genre", value)}
          />
        </>
      )}
    </View>
  );
};

const ChipGroup = ({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  selected: string;
}) => {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={[sectionTitleStyle, { fontSize: 16 }]}>
        {label}
      </Text>
      <View style={wrapRowStyle}>
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Chip
              key={option.value}
              label={option.label}
              onPress={() => onSelect(option.value)}
              selected={isSelected}
              textStyle={{ color: isSelected ? colors.surface : colors.text }}
            />
          );
        })}
      </View>
    </View>
  );
};
