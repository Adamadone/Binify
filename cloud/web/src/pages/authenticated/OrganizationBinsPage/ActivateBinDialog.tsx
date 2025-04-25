import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { trpc } from "@/libs/trpc";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

type Props = {
	open: boolean;
	onClose: () => void;
	organizationId: number;
};

export const ActivateBinDialog = ({ open, onClose, organizationId }: Props) => {
	const [binCode, setBinCode] = useState("");
	const [binName, setBinName] = useState("");

	const queryClient = useQueryClient();
	const { mutate: activateBin, isPending } = useMutation(
		trpc.bins.activate.mutationOptions(),
	);

	const handleClose = () => {
		setBinCode("");
		setBinName("");
		onClose();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		activateBin(
			{ organizationId, activationCode: binCode, binName },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: trpc.bins.listActivatedForOrganization.pathKey(),
					});
					enqueueSnackbar({ variant: "success", message: "Bin activated" });
					setBinCode("");
					setBinName("");
					onClose();
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to activate bin",
					});
				},
			},
		);
	};

	const isBinNameValid = binName.trim().length >= 2;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Activate bin</DialogTitle>
					<DialogDescription>
						Activate a bin using its code and name
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="binCode">Bin code</Label>
							<Input
								id="binCode"
								type="text"
								value={binCode}
								onChange={(e) => setBinCode(e.target.value)}
								placeholder="Enter bin activation code"
								autoFocus
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="binName">Bin name</Label>
							<Input
								id="binName"
								type="text"
								value={binName}
								onChange={(e) => setBinName(e.target.value)}
								placeholder="Enter bin name"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							isLoading={isPending}
							disabled={!isBinNameValid}
						>
							Activate bin
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
