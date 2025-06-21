import type { TimeRange } from "./types";

/**
 * Formats a Date object's time to HH:MM format in UTC
 */
export const formatTime = (date: Date, includeSeconds = false): string => {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	if (includeSeconds) {
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${hours}:${minutes}:${seconds}`;
	}

	return `${hours}:${minutes}`;
};

/**
 * Formats a Date object to dd MMM HH:MM format in UTC
 * For non-24h time ranges, omits the time component
 */
export function formatDateTime(date: Date, timeRange?: TimeRange): string {
	if (timeRange === "5m") {
		const hh = String(date.getHours()).padStart(2, "0");
		const mm = String(date.getMinutes()).padStart(2, "0");
		const ss = String(date.getSeconds()).padStart(2, "0");
		return `${hh}:${mm}:${ss}`;
	}

	if (timeRange === "24h") {
		const hh = String(date.getHours()).padStart(2, "0");
		const mm = String(date.getMinutes()).padStart(2, "0");
		return `${hh}:${mm}`;
	}

	const dd = String(date.getDate()).padStart(2, "0");
	const MM = String(date.getMonth() + 1).padStart(2, "0");
	return `${dd}/${MM}`;
}
