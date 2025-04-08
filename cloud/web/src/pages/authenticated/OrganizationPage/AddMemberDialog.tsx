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
import { type AddMemberDialogProps, Role } from "./types";

export const AddMemberDialog: FC<AddMemberDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isSubmitting,
}) => {
	const [email, setEmail] = useState("");
	const [selectedRole, setSelectedRole] = useState<Role>(Role.VIEWER);
	const [isEmailValid, setIsEmailValid] = useState(false);

	// reset form when dialog closes
	useEffect(() => {
		if (!isOpen) {
			setEmail("");
			setSelectedRole(Role.VIEWER);
			setIsEmailValid(false);
		}
	}, [isOpen]);

	// validate email
	useEffect(() => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		setIsEmailValid(emailRegex.test(email.trim()));
	}, [email]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEmailValid) {
			onSubmit(email.trim(), selectedRole);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter user's email address"
								autoFocus
							/>
							{email.trim() && !isEmailValid && (
								<p className="text-sm text-destructive">
									Please enter a valid email address
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label>Role</Label>
							<div className="flex gap-4">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="role"
										checked={selectedRole === Role.VIEWER}
										onChange={() => setSelectedRole(Role.VIEWER)}
									/>
									Viewer
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="role"
										checked={selectedRole === Role.ADMIN}
										onChange={() => setSelectedRole(Role.ADMIN)}
									/>
									Admin
								</label>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!isEmailValid || isSubmitting}
							isLoading={isSubmitting}
						>
							Add Member
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
