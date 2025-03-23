import { Button } from "@/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type PaginationProps = {
	pageState: [number, Dispatch<SetStateAction<number>>];
	pageSize: number;
	total: number;
};

export const Pagination = ({
	pageState: [page, setPage],
	pageSize,
	total,
}: PaginationProps) => {
	const totalPages = Math.ceil(total / pageSize);

	return (
		<div className="flex items-center">
			<Button
				variant={"ghost"}
				disabled={page <= 0}
				onClick={() => setPage((prev) => prev - 1)}
			>
				<ChevronLeft />
				Previous
			</Button>
			<div className="text-sm">
				{page}/{totalPages}
			</div>
			<Button
				variant={"ghost"}
				disabled={page >= totalPages - 1}
				onClick={() => setPage((prev) => prev + 1)}
			>
				Next <ChevronRight />
			</Button>
		</div>
	);
};
