import type React from "react";

interface FullnessTooltipProps {
	active?: boolean;
	payload?: Array<{ payload?: { formattedTime?: string }; value?: number }>;
}

export const FullnessTooltip: React.FC<FullnessTooltipProps> = ({
	active,
	payload,
}) => {
	if (!active || !payload || !payload.length) return null;

	return (
		<div className="bg-background border rounded px-2 py-1 shadow-sm">
			<p className="text-xs font-medium">
				{payload[0]?.payload?.formattedTime}
			</p>
			<p className="text-xs text-muted-foreground">
				Fullness: {payload[0]?.value}%
			</p>
		</div>
	);
};

interface AirQualityTooltipProps {
	active?: boolean;
	payload?: Array<{ payload?: { formattedTime?: string }; value?: number }>;
}

export const AirQualityTooltip: React.FC<AirQualityTooltipProps> = ({
	active,
	payload,
}) => {
	if (!active || !payload || !payload.length) return null;

	return (
		<div className="bg-background border rounded px-2 py-1 shadow-sm">
			<p className="text-xs font-medium">
				{payload[0]?.payload?.formattedTime}
			</p>
			<p className="text-xs text-muted-foreground">
				Air Quality: {payload[0]?.value} ppm
			</p>
		</div>
	);
};
