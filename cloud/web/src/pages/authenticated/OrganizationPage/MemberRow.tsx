import { Button } from "@/components/button";
import { TableCell, TableRow } from "@/components/table";
import { User } from "lucide-react";
import type { FC } from "react";
import { RoleBadge } from "../../../components/RoleBadge";
import { type MemberRowProps, Role } from "./types";

export const MemberRow: FC<MemberRowProps> = ({
	member,
	isLastAdmin,
	onChangeRole,
	onRemove,
}) => (
	<TableRow>
		<TableCell className="align-middle">
			<div className="flex items-center gap-2">
				<User className="h-4 w-4" />
				{member.user.name}
			</div>
		</TableCell>
		<TableCell className="align-middle">{member.user.email}</TableCell>
		<TableCell className="align-middle">
			<RoleBadge role={member.role as Role} />
		</TableCell>
		<TableCell className="text-right align-middle">
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onChangeRole(member.userId, member.role as Role)}
					disabled={isLastAdmin && member.role === Role.ADMIN}
					aria-label={`Change role for ${member.user.name}`}
				>
					Change Role
				</Button>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => onRemove(member.userId)}
					disabled={isLastAdmin}
					aria-label={`Remove ${member.user.name}`}
				>
					Remove
				</Button>
			</div>
		</TableCell>
	</TableRow>
);

MemberRow.displayName = "MemberRow";
