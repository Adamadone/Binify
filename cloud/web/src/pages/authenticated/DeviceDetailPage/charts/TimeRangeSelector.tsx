import { Button } from "@/components/button";
import { ChevronDown } from "lucide-react";
import { type FC, useState } from "react";
import type { TimeRange } from "../types";
import { TIME_RANGE_LABELS } from "./chartUtils";

interface TimeRangeSelectorProps {
	timeRange: TimeRange;
	onChange: (range: TimeRange) => void;
}

export const TimeRangeSelector: FC<TimeRangeSelectorProps> = ({
	timeRange,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleSelect = (range: TimeRange) => {
		onChange(range);
		setIsOpen(false);
	};

	return (
		<div className="relative inline-block">
			<Button
				variant="outline"
				size="sm"
				onClick={toggleDropdown}
				className="flex items-center gap-2"
			>
				{TIME_RANGE_LABELS[timeRange]}
				<ChevronDown className="h-4 w-4" />
			</Button>

			{isOpen && (
				<div className="absolute right-0 mt-1 bg-background border rounded-md shadow-lg z-10 py-1 min-w-40">
					{(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
						<button
							key={range}
							type="button"
							className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${
								timeRange === range ? "bg-accent/50" : ""
							}`}
							onClick={() => handleSelect(range)}
						>
							{TIME_RANGE_LABELS[range]}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
