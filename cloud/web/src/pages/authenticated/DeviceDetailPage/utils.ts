import type { TimeRange } from "./types";

/**
 * Formats a Date object's time to HH:MM format in UTC
 */
export const formatUtcTime = (date: Date): string => {
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

/**
 * Formats a Date object to dd MMM HH:MM format in UTC
 * For non-24h time ranges, omits the time component
 */
export function formatUtcDateTime(date: Date, timeRange?: TimeRange): string {
	const hh = String(date.getUTCHours()).padStart(2, "0");
	const mm = String(date.getUTCMinutes()).padStart(2, "0");

	if (timeRange === "24h") {
		return `${hh}:${mm}`;
	}

	const dd = String(date.getUTCDate()).padStart(2, "0");
	const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${dd}/${MM}`;
}
