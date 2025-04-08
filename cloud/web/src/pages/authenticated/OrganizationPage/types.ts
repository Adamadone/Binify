import type { TrpcOutputs } from "@bin/api";

export enum Role {
	ADMIN = "ADMIN",
	VIEWER = "VIEWER",
}

export type Organization = TrpcOutputs["organizations"]["getById"];
export type Member = TrpcOutputs["organizations"]["listMembers"][number];

export interface DialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export interface EditNameDialogProps extends DialogProps {
	initialName: string;
	onSubmit: (name: string) => void;
	isSubmitting: boolean;
}

export interface AddMemberDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (email: string, role: Role) => void;
	isSubmitting: boolean;
}

export interface ChangeMemberRoleDialogProps extends DialogProps {
	initialRole: Role;
	onSubmit: (role: Role) => void;
	isSubmitting: boolean;
}

export interface ConfirmationDialogProps extends DialogProps {
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
	isConfirming: boolean;
	variant?: "destructive" | "default";
}

export interface MemberRowProps {
	member: Member;
	isLastAdmin: boolean;
	onChangeRole: (userId: number, currentRole: Role) => void;
	onRemove: (userId: number) => void;
}
