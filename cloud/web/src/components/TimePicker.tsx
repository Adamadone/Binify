"use client";

import { cn } from "@/helpers/utils";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface TimePickerProps {
	date?: Date;
	onTimeChange: (date?: Date) => void;
	className?: string;
	showSeconds?: boolean;
}

export function TimePicker({
	date,
	onTimeChange,
	className,
	showSeconds = false,
}: TimePickerProps) {
	const currentDate = date || new Date();

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!date) return;

		const [hours, minutes] = e.target.value.split(":").map(Number);
		const newDate = new Date(date);
		newDate.setHours(hours ?? 0, minutes ?? 0, 0);
		onTimeChange(newDate);
	};

	// Format current time as HH:MM
	const formatTime = () => {
		const hours = String(currentDate.getHours()).padStart(2, "0");
		const minutes = String(currentDate.getMinutes()).padStart(2, "0");

		if (showSeconds) {
			const seconds = String(currentDate.getSeconds()).padStart(2, "0");
			return `${hours}:${minutes}:${seconds}`;
		}

		return `${hours}:${minutes}`;
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"h-8 px-3 justify-start text-left font-normal",
						className,
					)}
				>
					<Clock className="mr-2 h-4 w-4" />
					{formatTime()}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3" align="start">
				<div className="space-y-2">
					<div className="grid gap-2">
						<div className="grid grid-cols-1 items-center gap-2">
							<input
								type="time"
								step={showSeconds ? "1" : "60"}
								value={
									showSeconds ? formatTime() : formatTime().substring(0, 5)
								}
								onChange={handleTimeChange}
								className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
								style={{ colorScheme: "dark light" }}
							/>
						</div>
					</div>
					<div className="flex justify-between">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const now = new Date();
								const newDate = date ? new Date(date) : now;
								newDate.setHours(
									now.getHours(),
									now.getMinutes(),
									now.getSeconds(),
								);
								onTimeChange(newDate);
							}}
						>
							Now
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (date) {
									const newDate = new Date(date);
									newDate.setHours(0, 0, 0);
									onTimeChange(newDate);
								}
							}}
						>
							00:00
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
