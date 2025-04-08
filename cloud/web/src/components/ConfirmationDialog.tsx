import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { AlertTriangle } from "lucide-react";
import type { FC } from "react";
import type { ConfirmationDialogProps } from "../pages/authenticated/OrganizationPage/types";

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
	isOpen,
	onClose,
	title,
	message,
	confirmLabel,
	onConfirm,
	isConfirming,
	variant = "destructive",
}) => (
	<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-destructive" />
					{title}
				</DialogTitle>
			</DialogHeader>
			<p>{message}</p>
			<DialogFooter>
				<Button variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button variant={variant} onClick={onConfirm} isLoading={isConfirming}>
					{confirmLabel}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
