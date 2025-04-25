import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { trpc } from "@/libs/trpc";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

type Props = {
	open: boolean;
	bin: { id: number; name: string } | null;
	onClose: () => void;
};

export const DeactivateBinDialog = ({ open, bin, onClose }: Props) => {
	const queryClient = useQueryClient();

	const { mutate: deactivateBin, isPending } = useMutation(
		trpc.bins.deactivate.mutationOptions(),
	);

	const handleConfirm = () => {
		if (!bin) return;

		deactivateBin(
			{ activatedBinId: bin.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: trpc.bins.listActivatedForOrganization.pathKey(),
					});
					enqueueSnackbar({ variant: "success", message: "Bin deactivated" });
					onClose();
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to deactivate bin",
					});
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Deactivate bin</DialogTitle>
					<DialogDescription>
						Are you sure you want to deactivate <strong>{bin?.name}</strong>?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						isLoading={isPending}
						onClick={handleConfirm}
					>
						Deactivate
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
