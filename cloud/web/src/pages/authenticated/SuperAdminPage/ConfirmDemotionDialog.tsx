import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";

type ConfirmDemotionDialogProps = {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
};

export const ConfirmDemotionDialog = ({
	open,
	onCancel,
	onConfirm,
	isLoading,
}: ConfirmDemotionDialogProps) => (
	<Dialog open={open} onOpenChange={onCancel}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Confirm Demotion</DialogTitle>
				<DialogDescription>
					Are you sure you want to demote this user from super admin role? This
					action cannot be undone.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>
					Confirm
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
