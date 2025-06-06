import { DynamicContent } from "@/components/DynamicContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { ChartContainer, ChartTooltip } from "@/components/chart";
import { type FC, useCallback, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DatePicker } from "../../../../components/datepicker";
import { useChartData } from "../../../../hooks/useChartData";
import { CHART, TIME_RANGE } from "../constants";
import type { TimeRange } from "../types";
import { formatTime } from "../utils";
import { FullnessTooltip } from "./ChartTooltips";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { chartConfig, generateTicks } from "./chartUtils";

interface FullnessChartProps {
	binId: string;
	initialTimeRange?: TimeRange;
	showTimeRangeSelector?: boolean;
	height?: number;
	className?: string;
	startDate?: Date;
	onDateChange?: (date?: Date) => void;
	showDatePicker?: boolean;
}

export const FullnessChart: FC<FullnessChartProps> = ({
	binId,
	initialTimeRange = TIME_RANGE.DEFAULT,
	showTimeRangeSelector = true,
	height = CHART.DEFAULT_HEIGHT,
	className,
	startDate: externalStartDate,
	onDateChange: externalOnDateChange,
}) => {
	const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
	const [internalStartDate, setInternalStartDate] = useState<Date | undefined>(
		undefined,
	);
	const startDate =
		externalStartDate !== undefined ? externalStartDate : internalStartDate;
	const onDateChange = externalOnDateChange || setInternalStartDate;

	// Use the custom hook for data fetching and processing
	const {
		data: fullnessData,
		isError,
		error,
		isLoading,
	} = useChartData({
		binId,
		timeRange,
		dataKey: "avgFulnessPercentage",
		startDate,
	});

	// Chart rendering function
	const renderFullnessChart = useCallback(() => {
		if (isError) {
			return (
				<div className="text-center text-red-500 p-6">
					Error loading data:{" "}
					{error instanceof Error ? error.message : "Unknown error"}
				</div>
			);
		}

		if (fullnessData.length === 0) {
			return (
				<div className="text-center text-muted-foreground p-6">
					No measurement data available for the selected time period.
				</div>
			);
		}

		return (
			<ChartContainer
				id={`fullness-${binId}`}
				config={chartConfig}
				width={typeof height === "number" ? "100%" : "100%"}
				height={height}
				role="img"
				aria-label="Bin fullness measurements chart"
			>
				<LineChart data={fullnessData} margin={CHART.MARGINS.FULLNESS}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<XAxis
						dataKey="intervalStart"
						type="number"
						scale="time"
						domain={["dataMin", "dataMax"]}
						tickFormatter={(ts) => {
							const date = new Date(ts);
							return timeRange === "24h"
								? formatTime(date)
								: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
						}}
						tickLine={false}
						axisLine={false}
						fontSize={12}
						ticks={generateTicks(fullnessData, timeRange)}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						fontSize={12}
						unit="%"
						domain={[0, 100]}
					/>
					<ChartTooltip
						cursor={false}
						content={({ active, payload }) => (
							<FullnessTooltip
								active={active}
								payload={
									payload as Array<{
										payload?: { formattedTime?: string };
										value?: number;
									}>
								}
							/>
						)}
					/>
					<Line
						dataKey="avgFulnessPercentage"
						type="monotone"
						stroke={CHART.COLORS.FULLNESS}
						strokeWidth={2}
						dot={timeRange !== "24h"}
						isAnimationActive={false}
					/>
				</LineChart>
			</ChartContainer>
		);
	}, [fullnessData, timeRange, binId, height, isError, error]);

	const combinedQuery = {
		data: fullnessData,
		isPending: isLoading,
		isError,
		error,
	};

	return (
		<div className={className}>
			{showTimeRangeSelector ? (
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle>Fullness Percentage</CardTitle>
						<div className="flex items-center gap-2">
							<TimeRangeSelector
								timeRange={timeRange}
								onChange={setTimeRange}
							/>
							<DatePicker date={startDate} onDateChange={onDateChange} />
						</div>
					</CardHeader>
					<CardContent>
						<DynamicContent
							{...combinedQuery}
							renderContent={renderFullnessChart}
						/>
					</CardContent>
				</Card>
			) : (
				<DynamicContent
					{...combinedQuery}
					renderContent={renderFullnessChart}
				/>
			)}
		</div>
	);
};
