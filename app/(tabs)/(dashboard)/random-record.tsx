import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import type { RandomRecordParams } from "@/api/types";
import { RandomRecordDetailScreen } from "@/features/records/record-detail-screen";

type RandomRecordSearchParams = Pick<
  RandomRecordParams,
  "added_from" | "added_to" | "artist" | "format" | "genre" | "q"
>;

const RandomRecordRoute = () => {
  const { added_from, added_to, artist, format, genre, q } =
    useLocalSearchParams<RandomRecordSearchParams>();
  const params = Object.fromEntries(
    Object.entries({ added_from, added_to, artist, format, genre, q }).filter(
      ([, value]) => value !== undefined,
    ),
  ) as RandomRecordParams;

  return <RandomRecordDetailScreen params={params} />;
};

export default RandomRecordRoute;
