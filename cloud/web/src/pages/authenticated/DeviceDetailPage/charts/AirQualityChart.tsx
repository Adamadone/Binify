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
								return timeRange === "24h"
									? formatTime(date)
									: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
							}}
							tickLine={false}
							axisLine={false}
							fontSize={12}
							ticks={generateTicks(airQualityData, timeRange)}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							fontSize={12}
							width={80}
							unit=" ppm"
							domain={["auto", "auto"]}
							padding={{ top: 15, bottom: 0 }}
							tickMargin={5}
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
							stroke={CHART.COLORS.AIR_QUALITY.GOOD}
							strokeWidth={2}
							dot={timeRange !== "24h"}
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
						<TimeRangeSelector timeRange={timeRange} onChange={setTimeRange} />
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
				<DynamicContent
					data={airQualityData}
					isPending={isLoading && airQualityData.length === 0}
					error={isError}
					renderContent={renderAirQualityChart}
				/>
			)}
		</div>
	);
};
