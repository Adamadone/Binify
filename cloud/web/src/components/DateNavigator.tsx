import { ArrowLeft, ArrowRight } from "lucide-react";
import type { FC } from "react";
import type { TimeRange } from "../pages/authenticated/DeviceDetailPage/types";
import { TimePicker } from "./TimePicker";
import { Button } from "./button";
import { DatePicker } from "./datepicker";

interface DateNavigatorProps {
	date?: Date;
	onDateChange: (date?: Date) => void;
	timeRange: TimeRange;
	className?: string;
}

export const DateNavigator: FC<DateNavigatorProps> = ({
	date,
	onDateChange,
	timeRange,
	className = "",
}) => {
	const navigateBackward = () => {
		const baseDate = date ? new Date(date) : new Date();

		// Adjust based on time range
		if (timeRange === "5m") {
			baseDate.setMinutes(baseDate.getMinutes() - 5);
		} else if (timeRange === "24h") {
			baseDate.setDate(baseDate.getDate() - 1);
		} else if (timeRange === "7d") {
			baseDate.setDate(baseDate.getDate() - 7);
		} else if (timeRange === "30d") {
			baseDate.setMonth(baseDate.getMonth() - 1);
		}

		onDateChange(baseDate);
	};

	const navigateForward = () => {
		if (!date) return;

		const baseDate = new Date(date);

		// Adjust based on time range
		if (timeRange === "5m") {
			baseDate.setMinutes(baseDate.getMinutes() + 5);
		} else if (timeRange === "24h") {
			baseDate.setDate(baseDate.getDate() + 1);
		} else if (timeRange === "7d") {
			baseDate.setDate(baseDate.getDate() + 7);
		} else if (timeRange === "30d") {
			baseDate.setMonth(baseDate.getMonth() + 1);
		}

		const now = new Date();

		// Check if we're reaching current time
		if (timeRange === "5m" && now.getTime() - baseDate.getTime() < 60000) {
			onDateChange(undefined);
			return;
		}

		// For other time ranges, check if we're reaching today
		if (timeRange !== "5m") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const compareDate = new Date(baseDate);
			compareDate.setHours(0, 0, 0, 0);

			if (compareDate >= today) {
				onDateChange(undefined);
				return;
			}
		}

		onDateChange(baseDate);
	};

	// Simple check if forward navigation is possible
	const canNavigateForward = (): boolean => {
		if (!date) return false;

		const now = new Date();

		if (timeRange === "5m") {
			return now.getTime() - date.getTime() > 5 * 60 * 1000;
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const compareDate = new Date(date);
		compareDate.setHours(0, 0, 0, 0);

		return compareDate < today;
	};

	return (
		<div className={`flex items-center gap-1 ${className}`}>
			<Button
				variant="ghost"
				size="icon"
				className="h-7 w-7 p-1"
				onClick={navigateBackward}
			>
				<ArrowLeft className="h-4 w-4" />
			</Button>

			<DatePicker
				date={date}
				onDateChange={onDateChange}
				className="h-7 px-2 py-1 text-xs"
			/>

			{timeRange === "5m" && (
				<TimePicker
					date={date}
					onTimeChange={onDateChange}
					className="h-7 px-2 py-1 text-xs"
					showSeconds={true}
				/>
			)}

			<Button
				variant="ghost"
				size="icon"
				className="h-7 w-7 p-1"
				disabled={!canNavigateForward()}
				onClick={navigateForward}
			>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
