import { DateNavigator } from "@/components/DateNavigator";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { TimeRangeSelector } from "@/pages/authenticated/DeviceDetailPage/charts/TimeRangeSelector";
import type {
	ActivatedBin,
	TimeRange,
} from "@/pages/authenticated/DeviceDetailPage/types";
import { type FC, useCallback, useEffect, useRef, useState } from "react";

interface AlertHistoryFiltersProps {
	timeRange: TimeRange;
	onTimeRangeChange: (timeRange: TimeRange) => void;

	date?: Date;
	onDateChange: (date?: Date) => void;

	selectedBinId?: number;
	onBinChange?: (binId?: number) => void;
	bins?: ActivatedBin[];
	showBinFilter?: boolean;

	onReset: () => void;

	isFixedBinContext?: boolean;
}

export const AlertHistoryFilters: FC<AlertHistoryFiltersProps> = ({
	timeRange,
	onTimeRangeChange,
	date,
	onDateChange,
	selectedBinId,
	onBinChange,
	bins = [],
	showBinFilter = true,
	onReset,
	isFixedBinContext = false,
}) => {
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const selectedBin = bins.find((bin) => bin.id === selectedBinId);
	const displayValue = selectedBin
		? selectedBin.name || `Bin ${selectedBin.id}`
		: "";

	const filteredBins = bins.filter((bin) => {
		const binName = bin.name || `Bin ${bin.id}`;
		return (
			binName.toLowerCase().includes(searchValue.toLowerCase()) ||
			bin.id.toString().includes(searchValue)
		);
	});

	const handleSelect = useCallback(
		(id: number | null) => {
			onBinChange?.(id === null ? undefined : id);
			setIsOpen(false);
			setSearchValue("");
		},
		[onBinChange],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
		setIsOpen(true);
		if (selectedBinId && e.target.value === "") {
			handleSelect(null);
		}
	};

	const handleInputFocus = () => {
		setIsOpen(true);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const hasActiveFilters =
		date || (!isFixedBinContext && selectedBinId) || timeRange !== "24h";

	return (
		<div className="flex items-center gap-2">
			<TimeRangeSelector timeRange={timeRange} onChange={onTimeRangeChange} />
			<DateNavigator
				date={date}
				onDateChange={onDateChange}
				timeRange={timeRange}
			/>

			{showBinFilter && bins.length > 0 && (
				<div ref={dropdownRef} className="relative">
					<Input
						ref={inputRef}
						type="text"
						value={searchValue || displayValue}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						placeholder="All bins"
						className="w-[160px] h-7 text-xs"
					/>
					{isOpen && (
						<div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
							<button
								type="button"
								className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
								onClick={() => handleSelect(null)}
							>
								All bins
							</button>
							{filteredBins.length > 0 ? (
								filteredBins.map((bin) => (
									<button
										type="button"
										key={bin.id}
										className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent cursor-pointer ${
											selectedBinId === bin.id ? "bg-accent" : ""
										}`}
										onClick={() => handleSelect(bin.id)}
									>
										{bin.name || `Bin ${bin.id}`}
									</button>
								))
							) : (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">
									No bins found
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{hasActiveFilters && (
				<Button variant="outline" onClick={onReset} size="sm">
					Reset Filters
				</Button>
			)}
		</div>
	);
};
