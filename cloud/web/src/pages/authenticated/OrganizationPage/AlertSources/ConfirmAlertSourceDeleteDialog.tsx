import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";

export type ConfirmAlertSourceDeleteDialogProps = {
	isOpen: boolean;
	isLoading: boolean;
	onSubmit: () => void;
	onClose: () => void;
};

export const ConfirmAlertSourceDeleteDialog = ({
	isOpen,
	isLoading,
	onClose,
	onSubmit,
}: ConfirmAlertSourceDeleteDialogProps) => (
	<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Confirm alert source deletion</DialogTitle>
			</DialogHeader>
			<DialogFooter>
				<Button
					variant={"destructive"}
					isLoading={isLoading}
					onClick={onSubmit}
				>
					Confirm
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
