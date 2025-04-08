import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { FC } from "react";
import { Role } from "../pages/authenticated/OrganizationPage/types";

export const RoleBadge: FC<{ role: Role }> = ({ role }) => (
	<div className="flex items-center gap-2">
		{role === Role.ADMIN ? (
			<>
				<ShieldAlert className="h-4 w-4 text-amber-500" />
				Admin
			</>
		) : (
			<>
				<ShieldCheck className="h-4 w-4 text-muted-foreground" />
				Viewer
			</>
		)}
	</div>
);
