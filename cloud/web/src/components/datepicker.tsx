"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/helpers/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
	date?: Date;
	onDateChange: (date?: Date) => void;
	className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn("justify-start text-left font-normal h-8", className)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? (
						`From: ${format(date, "MMM d, yyyy")}`
					) : (
						<span>From Now</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={onDateChange}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
