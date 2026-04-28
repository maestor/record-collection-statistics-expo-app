import * as React from "react";
import { Keyboard, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiltersQuery, useRecordsQuery } from "@/api/queries";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Panel } from "@/components/panel";
import { SelectionTrigger } from "@/components/selection-trigger";
import { Section } from "@/components/section";
import { StatusMessage } from "@/components/status-message";
import { useTranslation } from "@/localization/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import {
  cardFrameStyle,
  getSafeAreaPaddingStyle,
  screenStyles,
  sectionTitleStyle,
  wrapRowStyle,
} from "@/theme/styles";
import { formatCount } from "@/utils/format";
import { RecordCard } from "./record-card";
import {
  buildRecordListParams,
  buildRandomRecordParams,
  haveDraftFiltersChanged,
  labelForSort,
  normalizeSearchQuery,
  orderOptions,
  sortOptions,
  type FilterKey,
  type OrderValue,
  type SelectedRecordFilters,
  type SortValue,
} from "./records-helpers";

const AUTO_SEARCH_DELAY_MS = 500;
const AUTO_SEARCH_MIN_LENGTH = 3;

export const RecordsScreen = () => {
  const { t } = useTranslation();
  const [draftQuery, setDraftQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = React.useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortValue>("date_added");
  const [order, setOrder] = React.useState<OrderValue>("desc");
  const [selectedFilters, setSelectedFilters] = React.useState<SelectedRecordFilters>({});
  const [draftSort, setDraftSort] = React.useState<SortValue>("date_added");
  const [draftOrder, setDraftOrder] = React.useState<OrderValue>("desc");
  const [draftSelectedFilters, setDraftSelectedFilters] = React.useState<SelectedRecordFilters>({});
  const params = React.useMemo(
    () => buildRecordListParams(query, sort, order, selectedFilters),
    [order, query, selectedFilters, sort],
  );
  const randomRecordParams = React.useMemo(() => buildRandomRecordParams(params), [params]);
  const recordsQuery = useRecordsQuery(params);
  const filtersQuery = useFiltersQuery(10, filtersOpen);
  const records = recordsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = recordsQuery.data?.pages[0];
  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length + (query ? 1 : 0);
  const hasDraftFilterChanges = haveDraftFiltersChanged(
    sort,
    draftSort,
    order,
    draftOrder,
    selectedFilters,
    draftSelectedFilters,
  );

  React.useEffect(() => {
    const normalizedDraftQuery = normalizeSearchQuery(draftQuery);

    if (normalizedDraftQuery === query) {
      return;
    }

    if (normalizedDraftQuery.length !== 0 && normalizedDraftQuery.length < AUTO_SEARCH_MIN_LENGTH) {
      return;
    }

    const timeout = setTimeout(() => {
      setPendingSearchQuery(normalizedDraftQuery);
      setQuery(normalizedDraftQuery);
    }, AUTO_SEARCH_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [draftQuery, query]);

  React.useEffect(() => {
    if (pendingSearchQuery === query && recordsQuery.isSuccess && !recordsQuery.isFetching) {
      Keyboard.dismiss();
      setPendingSearchQuery(null);
    }
  }, [pendingSearchQuery, query, recordsQuery.isFetching, recordsQuery.isSuccess]);

  const openFilters = () => {
    setDraftSort(sort);
    setDraftOrder(order);
    setDraftSelectedFilters(selectedFilters);
    setFiltersOpen(true);
  };

  const setDraftFilter = (key: FilterKey, value: string) => {
    setDraftSelectedFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  };

  const updateDraftQuery = (nextQuery: string) => {
    setDraftQuery(nextQuery);
    setPendingSearchQuery(null);
  };

  const applySearch = (nextQuery: string) => {
    const normalizedQuery = normalizeSearchQuery(nextQuery);
    setPendingSearchQuery(normalizedQuery);
    setQuery(normalizedQuery);
  };

  const clearSearch = () => {
    setDraftQuery("");
    setPendingSearchQuery("");
    setQuery("");
  };

  const clearFilters = () => {
    setDraftQuery("");
    setQuery("");
    setPendingSearchQuery(null);
    setDraftSelectedFilters({});
    setSelectedFilters({});
    setDraftSort("date_added");
    setSort("date_added");
    setDraftOrder("desc");
    setOrder("desc");
  };

  const applyFilters = () => {
    setSelectedFilters(draftSelectedFilters);
    setSort(draftSort);
    setOrder(draftOrder);
    setFiltersOpen(false);
  };

  const closeFilters = () => {
    if (
      haveDraftFiltersChanged(
        sort,
        draftSort,
        order,
        draftOrder,
        selectedFilters,
        draftSelectedFilters,
      )
    ) {
      applyFilters();
      return;
    }

    setFiltersOpen(false);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={screenStyles.scrollView}
      contentContainerStyle={screenStyles.content}
    >
      <Section title={t("records.searchTitle")}>
        <View style={{ gap: spacing.md }}>
          <View
            style={[
              cardFrameStyle,
              {
                alignItems: "center",
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: "row",
                minHeight: 52,
                paddingLeft: spacing.md,
                paddingRight: draftQuery.length > 0 ? spacing.sm : spacing.md,
              },
            ]}
          >
            <TextInput
              accessibilityLabel={t("records.searchLabel")}
              autoCapitalize="none"
              onChangeText={updateDraftQuery}
              onSubmitEditing={() => applySearch(draftQuery)}
              placeholder={t("records.searchPlaceholder")}
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={{
                color: colors.text,
                flex: 1,
                fontSize: 16,
                minHeight: 52,
                padding: 0,
                paddingRight: spacing.sm,
              }}
              value={draftQuery}
            />
            {draftQuery.length > 0 && (
              <Pressable
                accessibilityLabel={t("records.clearSearch")}
                accessibilityRole="button"
                hitSlop={spacing.sm}
                onPress={clearSearch}
                style={{
                  alignItems: "center",
                  borderRadius: 18,
                  height: 36,
                  justifyContent: "center",
                  width: 36,
                }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 28,
                    lineHeight: 30,
                  }}
                >
                  ×
                </Text>
              </Pressable>
            )}
          </View>
          <SelectionTrigger
            accessibilityLabel={`${t("records.filtersButton")}${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
            actionLabel={t("records.selectFilters")}
            label={`${t("records.filtersButton")}${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
            onPress={openFilters}
            style={{ width: "100%" }}
          />
          <Link
            href={{ pathname: "/random-record", params: randomRecordParams }}
            asChild
          >
            <Button
              accessibilityLabel={t("records.randomRecordButton")}
              label={t("records.randomRecordButton")}
              variant="secondary"
            />
          </Link>
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
        closeFilters={closeFilters}
        filters={filtersQuery.data?.data}
        draftOrder={draftOrder}
        draftSelectedFilters={draftSelectedFilters}
        draftSort={draftSort}
        hasDraftFilterChanges={hasDraftFilterChanges}
        isLoading={filtersQuery.isLoading}
        isOpen={filtersOpen}
        setDraftFilter={setDraftFilter}
        setDraftOrder={setDraftOrder}
        setDraftSort={setDraftSort}
      />

      {firstPage && (
        <Section
          title={t("records.resultsTitle", {
            count: formatCount(firstPage.meta.total),
          })}
        >
          <View style={{ gap: spacing.md }}>
            {records.length === 0 ? (
              <StatusMessage message={t("records.emptyMessage")} title={t("records.emptyTitle")} />
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
};

type FilterSheetProps = {
  clearFilters: () => void;
  closeFilters: () => void;
  draftOrder: OrderValue;
  draftSelectedFilters: SelectedRecordFilters;
  draftSort: SortValue;
  filters: ReturnType<typeof useFiltersQuery>["data"] extends infer Result
    ? Result extends { data: infer Data }
      ? Data
      : undefined
    : undefined;
  hasDraftFilterChanges: boolean;
  isLoading: boolean;
  isOpen: boolean;
  setDraftFilter: (key: FilterKey, value: string) => void;
  setDraftOrder: (order: OrderValue) => void;
  setDraftSort: (sort: SortValue) => void;
};

const FilterSheet = ({
  clearFilters,
  closeFilters,
  draftOrder,
  draftSelectedFilters,
  draftSort,
  filters,
  hasDraftFilterChanges,
  isLoading,
  isOpen,
  setDraftFilter,
  setDraftOrder,
  setDraftSort,
}: FilterSheetProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={closeFilters}
      statusBarTranslucent
      transparent
      visible={isOpen}
    >
      <View
        testID="records-filter-sheet-overlay"
        style={[
          {
            backgroundColor: "rgba(3, 31, 52, 0.72)",
            flex: 1,
            justifyContent: "center",
          },
          getSafeAreaPaddingStyle(insets),
        ]}
      >
        <Panel
          accessibilityLabel={t("records.filterPanelLabel")}
          backgroundColor={colors.surface}
          borderColor={colors.border}
          cornerRadius="lg"
          style={{ flex: 1, maxHeight: "100%", padding: spacing.lg, marginHorizontal: spacing.lg }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.md,
              justifyContent: "space-between",
            }}
          >
            <Text style={[sectionTitleStyle, { flex: 1 }]}>{t("records.filtersButton")}</Text>
            <Button
              label={
                hasDraftFilterChanges ? t("records.confirmFilters") : t("records.closeFilters")
              }
              onPress={closeFilters}
              variant={hasDraftFilterChanges ? "primary" : "secondary"}
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
                order={draftOrder}
                selectedFilters={draftSelectedFilters}
                setFilter={setDraftFilter}
                setOrder={setDraftOrder}
                setSort={setDraftSort}
                sort={draftSort}
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

type FilterPanelProps = {
  filters: FilterSheetProps["filters"];
  isLoading: boolean;
  order: OrderValue;
  selectedFilters: SelectedRecordFilters;
  setFilter: (key: FilterKey, value: string) => void;
  setOrder: (order: OrderValue) => void;
  setSort: (sort: SortValue) => void;
  sort: SortValue;
};

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
            label={t("dimensions.added_year")}
            options={filters.addedYears.map((item) => ({
              label: item.value,
              value: item.value,
            }))}
            selected={selectedFilters.added_year ?? ""}
            onSelect={(value) => setFilter("added_year", value)}
          />
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
