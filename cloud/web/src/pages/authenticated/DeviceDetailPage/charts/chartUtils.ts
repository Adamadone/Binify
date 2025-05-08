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
	"24h": 60,
	"7d": 24 * 60,
	"30d": 1440,
};

// Milliseconds for each time range
export const TIME_RANGE_MILLISECONDS = {
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
};

// Display labels for time ranges
export const TIME_RANGE_LABELS = {
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

	// 3) if 7‑day view, force exactly 7 daily ticks
	if (timeRange === "7d") {
		const oneDay = TIME_RANGE_MILLISECONDS["24h"];
		return Array.from({ length: 7 }, (_, i) => firstTs + i * oneDay);
	}

	// Determine interval based on time range
	let interval: number;
	if (!timeRange || timeRange === "24h") {
		interval = 6 * 60 * 60 * 1000; // 6 hours for 24h view
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

const END_TIME = new Date();
/**
 * Calculate time range parameters for API queries
 */
export const getTimeRangeParams = (selectedRange: TimeRange) => {
	const groupByMins = TIME_RANGE_MINUTES[selectedRange];

	const startTime = new Date(
		END_TIME.getTime() - TIME_RANGE_MILLISECONDS[selectedRange],
	);

	if (groupByMins === 60) {
		startTime.setUTCMinutes(0, 0, 0);
	} else if (groupByMins >= 1440) {
		startTime.setUTCHours(0, 0, 0, 0);
	}

	return {
		from: startTime.toISOString(),
		to: END_TIME.toISOString(),
		groupByMinutes: groupByMins,
	};
};
