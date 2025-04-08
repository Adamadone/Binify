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
import { type FC, useEffect, useState } from "react";
import type { EditNameDialogProps } from "./types";

export const EditNameDialog: FC<EditNameDialogProps> = ({
	isOpen,
	onClose,
	initialName,
	onSubmit,
	isSubmitting,
}) => {
	const [name, setName] = useState(initialName);

	useEffect(() => {
		if (isOpen) {
			setName(initialName);
		}
	}, [isOpen, initialName]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			onSubmit(name.trim());
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Organization Name</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!name.trim() || isSubmitting}
							isLoading={isSubmitting}
						>
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
