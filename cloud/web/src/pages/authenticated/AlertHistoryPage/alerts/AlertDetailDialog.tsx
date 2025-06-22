import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";

import type { TrpcOutputs } from "@bin/api";

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

type Props = {
	open: boolean;
	alert: Alert | null;
	onClose: () => void;
};

export const AlertDetailDialog = ({ open, alert, onClose }: Props) => {
	if (!alert) return null;

	const telegram = alert.alertSource.telegramAlertSource;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">
						Alert Details{" "}
						<span className="text-muted-foreground">(ID {alert.id})</span>
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Triggered at {new Date(alert.at).toLocaleString()}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4 text-sm">
					{/* Main two column grid */}
					<div className="grid grid-cols-2 gap-x-6 gap-y-4">
						{/* Bin name */}
						<div className="space-y-1">
							<p className="text-xs font-semibold text-muted-foreground uppercase">
								Bin name
							</p>
							<p className="text-foreground">
								{alert.activatedBin?.name || `Bin ${alert.activatedBinId}`}
							</p>
						</div>

						{/* Alert source name */}
						<div className="space-y-1">
							<p className="text-xs font-semibold text-muted-foreground uppercase">
								Alert source name
							</p>
							<p className="text-foreground">{alert.alertSource.name}</p>
						</div>

						{/* Bin ID */}
						<div className="space-y-1">
							<p className="text-xs font-semibold text-muted-foreground uppercase">
								Activated bin ID
							</p>
							<p className="text-foreground">{alert.activatedBinId}</p>
						</div>

						{/* Threshold */}
						{alert.alertSource.thresholdPercent !== null && (
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground uppercase">
									Threshold
								</p>
								<p className="text-foreground">
									{alert.alertSource.thresholdPercent}%
								</p>
							</div>
						)}

						{/* Repeat interval */}
						{alert.alertSource.repeatMinutes !== null && (
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground uppercase">
									Frequency
								</p>
								<p className="text-foreground">
									Every {alert.alertSource.repeatMinutes} minutes
								</p>
							</div>
						)}
					</div>

					{/* Telegram block */}
					{telegram && (
						<div className="border-t pt-4 space-y-2">
							<p className="text-sm font-semibold">Telegram Alert Target</p>
							<div className="grid grid-cols-2 gap-y-2 text-sm">
								<p className="text-muted-foreground">Username</p>
								<p className="text-foreground">{telegram.username ?? "–"}</p>

								<p className="text-muted-foreground">Chat ID</p>
								<p className="text-foreground">{telegram.chatId ?? "–"}</p>

								<p className="text-muted-foreground">Activation code</p>
								<p className="text-foreground break-all">
									{telegram.activationCode}
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
