import type { TimeRange } from "../types";

// Chart configurations for different metrics
export const chartConfig = {
	avgFulnessPercentage: {
		label: "Fullness %",
		color: "hsl(var(--chart-1))",
	},
	avgAirQualityPpm: {
		label: "Air Quality (ppm)",
		color: "hsl(var(--chart-3))",
	},
};

// Time intervals for different time range views
export const TIME_RANGE_MINUTES = {
	"5m": 0.5,
	"24h": 60,
	"7d": 24 * 60,
	"30d": 1440,
};

// Milliseconds for each time range
export const TIME_RANGE_MILLISECONDS = {
	"5m": 5 * 60 * 1000,
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
};

// Display labels for time ranges
export const TIME_RANGE_LABELS = {
	"5m": "Last 5 Minutes",
	"24h": "Last 24 Hours",
	"7d": "Last 7 Days",
	"30d": "Last 30 Days",
};

/**
 * Generates chart ticks based on data points and time range
 * Supports variable intervals based on the selected time range
 */
export const generateTicks = (
	data: { intervalStart: number | string }[],
	timeRange?: TimeRange,
): number[] => {
	if (data.length === 0) return [];

	const first = data[0];
	const last = data[data.length - 1];
	if (!first || !last) return [];

	const firstTs =
		typeof first.intervalStart === "number"
			? first.intervalStart
			: new Date(first.intervalStart).getTime();
	const lastTs =
		typeof last.intervalStart === "number"
			? last.intervalStart
			: new Date(last.intervalStart).getTime();

	if (timeRange === "5m") {
		const dataTimestamps = data.map((d) =>
			typeof d.intervalStart === "number"
				? d.intervalStart
				: new Date(d.intervalStart).getTime(),
		);

		if (dataTimestamps.length <= 10) {
			return dataTimestamps;
		}
		const step = Math.ceil(dataTimestamps.length / 10);
		const result: number[] = [];
		for (let i = 0; i < dataTimestamps.length; i += step) {
			const timestamp = dataTimestamps[i];
			if (timestamp !== undefined) {
				result.push(timestamp);
			}
		}
		const lastTimestamp = dataTimestamps[dataTimestamps.length - 1];
		if (
			lastTimestamp !== undefined &&
			result[result.length - 1] !== lastTimestamp
		) {
			result.push(lastTimestamp);
		}
		return result;
	}

	let interval: number;
	if (!timeRange || timeRange === "24h") {
		interval = 2 * 60 * 60 * 1000; // 2 hours for 24h view
	} else if (timeRange === "30d") {
		interval = 7 * 24 * 60 * 60 * 1000; // 1 week for 30d view
	} else {
		interval = 24 * 60 * 60 * 1000; // 1 day for 7d view
	}

	const result = [firstTs];
	const startTick = Math.ceil(firstTs / interval) * interval;

	for (let t = startTick; t < lastTs; t += interval) {
		if (t > firstTs) result.push(t);
	}

	if (result[result.length - 1] !== lastTs) {
		result.push(lastTs);
	}

	return result;
};
/**
 * Calculate time range parameters for API queries
 * @param selectedRange The selected time range (24h, 7d, 30d)
 * @param referenceDate Optional date to use as reference point instead of current time
 */
export const getTimeRangeParams = (
	selectedRange: TimeRange,
	referenceDate?: Date,
) => {
	const groupByMins = TIME_RANGE_MINUTES[selectedRange];

	const endTime = referenceDate ? new Date(referenceDate) : new Date();

	if (referenceDate && selectedRange === "24h") {
		const startTime = new Date(referenceDate);
		startTime.setHours(0, 0, 0, 0);

		const nextDay = new Date(referenceDate);
		nextDay.setDate(nextDay.getDate() + 1);
		nextDay.setHours(0, 0, 0, 0);

		return {
			from: startTime.toISOString(),
			to: nextDay.toISOString(),
			groupByMinutes: groupByMins,
		};
	}

	// Keep exact time for 5m view
	if (referenceDate && selectedRange !== "5m") {
		endTime.setHours(23, 59, 59, 999);
	}

	const startTime = new Date(
		endTime.getTime() - TIME_RANGE_MILLISECONDS[selectedRange],
	);

	// For 5m view, ensure we keep seconds precision
	if (selectedRange === "5m") {
	} else if (groupByMins === 60) {
		startTime.setUTCMinutes(0, 0, 0);
	} else if (groupByMins >= 1440) {
		startTime.setUTCHours(0, 0, 0, 0);
	}

	return {
		from: startTime.toISOString(),
		to: endTime.toISOString(),
		groupByMinutes: selectedRange === "5m" ? 0.5 : groupByMins,
	};
};
