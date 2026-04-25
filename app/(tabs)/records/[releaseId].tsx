import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import { RecordDetailScreen } from "@/features/records/record-detail-screen";

export default function RecordDetailRoute() {
  const { releaseId } = useLocalSearchParams<{ releaseId: string }>();
  const parsedReleaseId = Number(releaseId);

  return <RecordDetailScreen releaseId={parsedReleaseId} />;
}
