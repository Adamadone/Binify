import type { TrpcOutputs } from "@bin/api";

export type TimeRange = "24h" | "7d" | "30d";

export type ActivatedBin =
	TrpcOutputs["bins"]["listActivatedForOrganization"]["bins"][0];
/**
 * Represents statistics data for a single bin
 * including measurement intervals and fullness percentages
 */
export type BinStats = {
	binId: number;
	binName: string;
	intervals: Array<{
		intervalStart: number | string;
		formattedTime?: string;
		avgFulnessPercentage: number;
		avgAirQualityPpm?: number;
	}>;
};

/**
 * Combined result from multiple bin statistics queries
 * including loading states and error handling
 */
export type CombinedQueryResult = {
	data: BinStats[];
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: unknown;
};
