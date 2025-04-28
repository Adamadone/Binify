import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { useState } from "react";

type PromoteUserDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (email: string) => void;
	isLoading?: boolean;
};

export const PromoteUserDialog = ({
	open,
	onClose,
	onSubmit,
	isLoading,
}: PromoteUserDialogProps) => {
	const [email, setEmail] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(email);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Promote to Super Admin</DialogTitle>
					<DialogDescription>
						Enter the email of the user you want to promote.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="grid gap-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<input
							id="email"
							type="email"
							className="border rounded px-3 py-2 text-sm w-full"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<DialogFooter>
						<Button type="submit" isLoading={isLoading}>
							Promote
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
