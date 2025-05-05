import { trpc } from "@/libs/trpc";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getTimeRangeParams } from "../pages/authenticated/DeviceDetailPage/charts/chartUtils";
import { QUERY } from "../pages/authenticated/DeviceDetailPage/constants";
import type { TimeRange } from "../pages/authenticated/DeviceDetailPage/types";
import { formatUtcDateTime } from "../pages/authenticated/DeviceDetailPage/utils";

type DataPoint = {
	avgFulnessPercentage?: number | null;
	avgAirQualityPpm?: number | null;
	intervalStart: string;
};

export type ChartData = {
	intervalStart: number;
	formattedTime: string;
	avgFulnessPercentage?: number;
	avgAirQualityPpm?: number;
};

interface UseChartDataOptions {
	binId: string;
	timeRange: TimeRange;
	latestTimestamp?: string | Date;
	dataKey: "avgFulnessPercentage" | "avgAirQualityPpm";
}

/**
 * Custom hook for fetching and processing chart data
 * Handles data loading, transformation, and error states
 */
export function useChartData({
	binId,
	timeRange,
	latestTimestamp,
	dataKey,
}: UseChartDataOptions) {
	// Fetch statistics from the API
	const query = useQuery(
		trpc.bins.statistics.queryOptions(
			{
				activatedBinId: Number(binId),
				...getTimeRangeParams(timeRange, latestTimestamp),
			},
			{
				staleTime: QUERY.STALE_TIME,
				enabled: !!binId && !!latestTimestamp,
			},
		),
	);

	// Process and transform the raw data for charts
	const chartData = useMemo<ChartData[] | undefined>(() => {
		if (!query.data) return undefined;

		return query.data.intervals
			.filter((interval) => interval[dataKey] !== null)
			.map((interval: DataPoint) => {
				const date = new Date(interval.intervalStart);
				return {
					intervalStart: date.getTime(),
					formattedTime: formatUtcDateTime(date, timeRange),
					[dataKey]: interval[dataKey] ?? undefined,
				};
			})
			.sort((a, b) => a.intervalStart - b.intervalStart);
	}, [query.data, dataKey, timeRange]);

	return { ...query, data: chartData || [] };
}
