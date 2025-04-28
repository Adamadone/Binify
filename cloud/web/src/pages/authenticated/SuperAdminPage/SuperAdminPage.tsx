import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UserMinus } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/tooltip";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { ConfirmDemotionDialog } from "./ConfirmDemotionDialog";
import { PromoteUserDialog } from "./PromoteUserDialog";

// -------------------- Constants --------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -------------------- Component --------------------
export const SuperAdminPage = () => {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [confirmUserId, setConfirmUserId] = useState<number | null>(null);

	const queryClient = useQueryClient();

	const { mutate: promoteUser, isPending: isPromoting } = useMutation(
		trpc.accounts.makeUserSuperAdmin.mutationOptions(),
	);

	const { mutate: demoteUser, isPending: isDemoting } = useMutation(
		trpc.accounts.demoteUserFromSuperAdmin.mutationOptions(),
	);

	const userQuery = useQuery(trpc.accounts.listSuperAdmins.queryOptions());

	const handlePromote = (email: string) => {
		if (!email.trim()) {
			enqueueSnackbar({ variant: "error", message: "Email is required." });
			return;
		}
		if (!EMAIL_REGEX.test(email)) {
			enqueueSnackbar({ variant: "error", message: "Invalid email format." });
			return;
		}
		promoteUser(
			{ email: email.trim() },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: trpc.accounts.listSuperAdmins.pathKey(),
					});
					enqueueSnackbar({ variant: "success", message: "User promoted." });
					setIsCreateDialogOpen(false);
				},
				onError: (error) => {
					enqueueSnackbar({
						variant: "error",
						message: error?.message ?? "Failed to promote user.",
					});
				},
			},
		);
	};

	const handleDemote = () => {
		if (confirmUserId === null) return;
		demoteUser(
			{ userId: confirmUserId },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: trpc.accounts.listSuperAdmins.pathKey(),
					});
					enqueueSnackbar({ variant: "success", message: "User demoted." });
					setConfirmUserId(null);
				},
				onError: (error) => {
					enqueueSnackbar({
						variant: "error",
						message: error?.message ?? "Failed to demote user.",
					});
				},
			},
		);
	};

	const renderContent: RenderContent<
		TrpcOutputs["accounts"]["listSuperAdmins"]
	> = (users) => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>User ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>{user.id}</TableCell>
						<TableCell>{user.name}</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell className="text-right">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="destructive"
											size="icon"
											isLoading={confirmUserId === user.id && isDemoting}
											onClick={() => setConfirmUserId(user.id)}
										>
											<UserMinus className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Demote from Super Admin</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<>
			<ConfirmDemotionDialog
				open={confirmUserId !== null}
				onCancel={() => setConfirmUserId(null)}
				onConfirm={handleDemote}
				isLoading={isDemoting}
			/>

			<PromoteUserDialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onSubmit={handlePromote}
				isLoading={isPromoting}
			/>

			<Layout title="Manage Super Admins">
				<div className="flex justify-end mb-2">
					<Button onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Promote User
					</Button>
				</div>
				<DynamicContent {...userQuery} renderContent={renderContent} />
			</Layout>
		</>
	);
};
