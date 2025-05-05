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
export const formatUtcDateTime = (
	date: Date,
	timeRange?: TimeRange,
): string => {
	const day = String(date.getUTCDate()).padStart(2, "0");
	const month = date.toLocaleString("en-US", {
		month: "short",
		timeZone: "UTC",
	});
	const time = formatUtcTime(date);

	if (!timeRange || timeRange === "24h") {
		return `${day} ${month} ${time}`;
	}
	return `${day} ${month}`;
};
