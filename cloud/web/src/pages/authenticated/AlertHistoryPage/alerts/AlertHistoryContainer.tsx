import { DynamicContent } from "@/components/DynamicContent";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { useAlertHistory } from "@/hooks/useAlertHistory";
import { TIME_RANGE } from "@/pages/authenticated/DeviceDetailPage/constants";
import type {
	ActivatedBin,
	TimeRange,
} from "@/pages/authenticated/DeviceDetailPage/types";
import type { TrpcOutputs } from "@bin/api";
import { type FC, useState } from "react";
import { AlertHistoryFilters } from "./AlertHistoryFilters";
import { AlertHistoryTable } from "./AlertHistoryTable";

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

interface AlertHistoryContainerProps {
	organizationId: number;
	binId?: number;
	bins?: ActivatedBin[];
	showBinControls?: boolean;
	title?: string;
	pageSize?: number;
	onAlertClick?: (alert: Alert) => void;
}

export const AlertHistoryContainer: FC<AlertHistoryContainerProps> = ({
	organizationId,
	binId,
	bins = [],
	showBinControls = true,
	title = "Alert History",
	pageSize = 50,
	onAlertClick,
}) => {
	const [page, setPage] = useState(0);
	const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGE.DEFAULT);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedBinId, setSelectedBinId] = useState<number | undefined>(binId);

	const effectiveBinId = binId || selectedBinId;

	const alertsQuery = useAlertHistory({
		organizationId,
		page,
		pageSize,
		timeRange,
		selectedDate,
		binId: effectiveBinId,
	});

	const handleReset = () => {
		setSelectedDate(undefined);
		setTimeRange(TIME_RANGE.DEFAULT);
		if (!binId) {
			setSelectedBinId(undefined);
		}
		setPage(0);
	};

	const handleTimeRangeChange = (newTimeRange: TimeRange) => {
		setTimeRange(newTimeRange);
		setPage(0);
	};

	const handleDateChange = (date?: Date) => {
		setSelectedDate(date);
		setPage(0);
	};

	const handleBinChange = (newBinId?: number) => {
		setSelectedBinId(newBinId);
		setPage(0);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle>{title}</CardTitle>
				<AlertHistoryFilters
					timeRange={timeRange}
					onTimeRangeChange={handleTimeRangeChange}
					date={selectedDate}
					onDateChange={handleDateChange}
					selectedBinId={selectedBinId}
					onBinChange={!binId ? handleBinChange : undefined}
					bins={bins}
					showBinFilter={showBinControls && !binId}
					onReset={handleReset}
					isFixedBinContext={!!binId}
				/>
			</CardHeader>
			<CardContent>
				<DynamicContent
					{...alertsQuery}
					renderContent={(data) => (
						<>
							<AlertHistoryTable
								alerts={data.sentAlerts}
								onAlertClick={onAlertClick}
								showBinColumn={showBinControls}
							/>
							{data.totalCount > pageSize && (
								<div className="flex justify-end mt-4">
									<Pagination
										pageState={[page, setPage]}
										pageSize={pageSize}
										total={data.totalCount}
									/>
								</div>
							)}
						</>
					)}
				/>
			</CardContent>
		</Card>
	);
};
