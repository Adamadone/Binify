import { trpc } from "@/libs/trpc";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getTimeRangeParams } from "../pages/authenticated/DeviceDetailPage/charts/chartUtils";
import type { TimeRange } from "../pages/authenticated/DeviceDetailPage/types";

interface UseAlertHistoryOptions {
	organizationId: number;
	page: number;
	pageSize: number;
	timeRange: TimeRange;
	selectedDate?: Date;
	binId?: number;
}

/**
 * Custom hook for fetching alert history with time range filtering
 * Handles date range calculation and query options
 */
export function useAlertHistory({
	organizationId,
	page,
	pageSize,
	timeRange,
	selectedDate,
	binId,
}: UseAlertHistoryOptions) {
	const filter = useMemo(() => {
		const { from, to } = getTimeRangeParams(timeRange, selectedDate);

		return {
			binId,
			fromDate: from,
			toDate: to,
		};
	}, [timeRange, selectedDate, binId]);

	const query = useQuery(
		trpc.alerts.listOrganizationSentAlerts.queryOptions({
			organizationId,
			page,
			pageSize,
			filter,
		}),
	);

	return query;
}
