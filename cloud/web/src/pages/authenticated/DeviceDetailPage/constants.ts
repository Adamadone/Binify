import type { TimeRange } from "./types";

/**
 * Chart-related constants to avoid magic numbers throughout the codebase
 */
export const CHART = {
	// Heights
	DEFAULT_HEIGHT: 300,
	OVERVIEW_HEIGHT: 200,

	// Margins
	MARGINS: {
		FULLNESS: { top: 5, right: 10, left: -10, bottom: 5 },
		AIR_QUALITY: { top: 5, right: 10, left: -10, bottom: 10 },
	},

	// Colors
	COLORS: {
		FULLNESS: "#3b82f6", // blue
		AIR_QUALITY: {
			GOOD: "green",
			WARNING: "orange",
			DANGER: "red",
		},
	},

	// Air quality thresholds (ppm)
	AIR_QUALITY: {
		THRESHOLD_GOOD: 750,
		THRESHOLD_WARNING: 1200,
	},
};

/**
 * Query configuration constants
 */
export const QUERY = {
	STALE_TIME: 5 * 60 * 1000, // 5 minutes
	PAGE_SIZE: 100,
};

/**
 * Time range related constants
 */
export const TIME_RANGE = {
	DEFAULT: "24h" as TimeRange,
	LABELS: {
		"24h": "Last 24 Hours",
		"7d": "Last 7 Days",
		"30d": "Last 30 Days",
	} as Record<TimeRange, string>,

	// Time intervals in milliseconds
	MILLISECONDS: {
		"24h": 24 * 60 * 60 * 1000,
		"7d": 7 * 24 * 60 * 60 * 1000,
		"30d": 30 * 24 * 60 * 60 * 1000,
	} as Record<TimeRange, number>,
};
