import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import { formatDateTime } from "@/helpers/utils";
import type { TrpcOutputs } from "@bin/api";
import type { FC } from "react";

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

interface AlertHistoryTableProps {
	alerts: Alert[];
	onAlertClick?: (alert: Alert) => void;
	showBinColumn?: boolean;
}

export const AlertHistoryTable: FC<AlertHistoryTableProps> = ({
	alerts,
	onAlertClick,
	showBinColumn = true,
}) => {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{showBinColumn && <TableHead>Bin name</TableHead>}
					<TableHead>Alert source</TableHead>
					<TableHead>Sent at</TableHead>
					<TableHead>Threshold</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{alerts.map((alert) => (
					<TableRow
						key={alert.id}
						className={onAlertClick ? "cursor-pointer hover:bg-muted/50" : ""}
						onClick={() => onAlertClick?.(alert)}
					>
						{showBinColumn && (
							<TableCell>
								{alert.activatedBin?.name || `Bin ${alert.activatedBinId}`}
							</TableCell>
						)}
						<TableCell>{alert.alertSource.name}</TableCell>
						<TableCell>{formatDateTime(alert.at)}</TableCell>
						<TableCell>{alert.alertSource.thresholdPercent}%</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
