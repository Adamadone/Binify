import { DateNavigator } from "@/components/DateNavigator";
import { DynamicContent } from "@/components/DynamicContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { ChartContainer, ChartTooltip } from "@/components/chart";
import { type FC, useCallback, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartData, useChartData } from "../../../../hooks/useChartData";
import { CHART, TIME_RANGE } from "../constants";
import type { TimeRange } from "../types";
import { formatTime } from "../utils";
import { AirQualityTooltip } from "./ChartTooltips";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { chartConfig, generateTicks } from "./chartUtils";

interface AirQualityChartProps {
	binId: string;
	binName: string;
	initialTimeRange?: TimeRange;
	showTimeRangeSelector?: boolean;
	height?: number;
	className?: string;
}

export const AirQualityChart: FC<AirQualityChartProps> = ({
	binId,
	initialTimeRange = TIME_RANGE.DEFAULT,
	showTimeRangeSelector = true,
	height = CHART.DEFAULT_HEIGHT,
	className,
}) => {
	const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);

	// Use the custom hook for data fetching and processing
	const {
		data: airQualityData,
		isError,
		error,
		isLoading,
	} = useChartData({
		binId,
		timeRange,
		dataKey: "avgAirQualityPpm",
		startDate,
	});

	// Chart rendering function
	const renderAirQualityChart = useCallback(
		(airQualityData: ChartData[]) => {
			if (isError) {
				return (
					<div className="text-center text-red-500 p-6">
						Error loading data:{" "}
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
				);
			}

			if (airQualityData.length === 0) {
				return (
					<div className="text-center text-muted-foreground p-6">
						No air quality data available for the selected time period.
					</div>
				);
			}

			return (
				<ChartContainer
					id={`air-quality-${binId}`}
					config={chartConfig}
					width={typeof height === "number" ? "100%" : "100%"}
					height={height}
					role="img"
					aria-label="Air quality measurements chart"
				>
					<LineChart data={airQualityData} margin={CHART.MARGINS.AIR_QUALITY}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="intervalStart"
							type="number"
							scale="time"
							domain={["dataMin", "dataMax"]}
							tickFormatter={(ts) => {
								const date = new Date(ts);
								if (timeRange === "5m") {
									const hours = String(date.getHours()).padStart(2, "0");
									const minutes = String(date.getMinutes()).padStart(2, "0");
									const seconds = String(date.getSeconds()).padStart(2, "0");
									return `${hours}:${minutes}:${seconds}`;
								}
								if (timeRange === "24h") {
									return formatTime(date);
								}
								return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
							}}
							tickLine={false}
							axisLine={false}
							fontSize={12}
							ticks={generateTicks(airQualityData, timeRange)}
						/>
						<YAxis
							hide={false}
							tickLine={false}
							axisLine={false}
							fontSize={11}
							width={50}
							domain={[0, (dataMax: number) => Math.max(dataMax, 2500)]}
							ticks={[800, 1400, 2001]}
							tickFormatter={(value) => {
								if (value <= 800) return "Safe";
								if (value <= 2000) return "Normal";
								return "Dangerous";
							}}
							tick={(props) => {
								const { y, payload } = props;
								const value = payload.value;
								let color = "#22c55e"; // green for safe

								if (value === 1400) {
									color = "#eab308"; // yellow for normal
								} else if (value === 2001) {
									color = "#ef4444"; // red for dangerous
								}

								return (
									<text
										x={props.x}
										y={y}
										dy={4}
										textAnchor="end"
										fontSize={11}
										fontWeight="bold"
										style={{ fill: color, color: color }}
									>
										{value <= 800
											? "Safe"
											: value <= 2000
												? "Normal"
												: "Dangerous"}
									</text>
								);
							}}
						/>

						<ChartTooltip
							cursor={false}
							content={({ active, payload }) => (
								<AirQualityTooltip
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
							dataKey="avgAirQualityPpm"
							type="monotone"
							stroke="#3b82f6"
							strokeWidth={2}
							dot={true}
							isAnimationActive={false}
						/>
					</LineChart>
				</ChartContainer>
			);
		},
		[timeRange, binId, height, isError, error],
	);

	return (
		<div className={className}>
			{showTimeRangeSelector ? (
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle>Air Quality</CardTitle>
						<div className="flex items-center gap-2">
							<TimeRangeSelector
								timeRange={timeRange}
								onChange={setTimeRange}
							/>
							<DateNavigator
								date={startDate}
								onDateChange={setStartDate}
								timeRange={timeRange}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<DynamicContent
							data={airQualityData}
							isPending={isLoading && airQualityData.length === 0}
							error={isError}
							renderContent={renderAirQualityChart}
						/>
					</CardContent>
				</Card>
			) : (
				<>
					{/* For organizational bins page view */}
					<div
						className="absolute top-2 right-2 z-10"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
							}
						}}
					>
						<DateNavigator
							date={startDate}
							onDateChange={setStartDate}
							timeRange="24h"
							className="h-7 text-xs"
						/>
					</div>
					<DynamicContent
						data={airQualityData}
						isPending={isLoading && airQualityData.length === 0}
						error={isError}
						renderContent={renderAirQualityChart}
					/>
				</>
			)}
		</div>
	);
};
