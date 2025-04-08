import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { Label } from "@/components/label";
import { useEffect, useState } from "react";
import { type ChangeMemberRoleDialogProps, Role } from "./types";

export const ChangeMemberRoleDialog: React.FC<ChangeMemberRoleDialogProps> = ({
	isOpen,
	onClose,
	initialRole,
	onSubmit,
	isSubmitting,
}) => {
	const [role, setRole] = useState<Role>(initialRole);

	useEffect(() => {
		if (isOpen) {
			setRole(initialRole);
		}
	}, [isOpen, initialRole]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Member Role</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>New Role</Label>
						<div className="flex gap-4">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="newRole"
									checked={role === Role.VIEWER}
									onChange={() => setRole(Role.VIEWER)}
								/>
								Viewer
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="newRole"
									checked={role === Role.ADMIN}
									onChange={() => setRole(Role.ADMIN)}
								/>
								Admin
							</label>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={() => onSubmit(role)} isLoading={isSubmitting}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
