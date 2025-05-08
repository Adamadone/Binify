import { DynamicContent } from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Label } from "@/components/label";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit, Plus, Trash2 } from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { useOrganizationOperations } from "../../../hooks/useOrganizationOperations";
import { AddMemberDialog } from "./AddMemberDialog";
import { AlertSources } from "./AlertSources/AlertSources";
import { ChangeMemberRoleDialog } from "./ChangeMemberRoleDialog";
import { EditNameDialog } from "./EditNameDialog";
import { MemberRow } from "./MemberRow";
import { type Organization, Role } from "./types";

export const OrganizationPage: FC = () => {
	// Routing and state hooks
	const navigate = useNavigate();
	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;
	const id = Number(organizationId);

	useEffect(() => {
		if (!organizationId) {
			navigate({ to: "/" });
		}
	}, [organizationId, navigate]);

	// Organization operations hook
	const { operations, mutations } = useOrganizationOperations(id);

	// Dialog states
	const [dialogState, setDialogState] = useState({
		editName: false,
		addMember: false,
		deleteOrg: false,
		changeMemberRole: false,
		removeMember: false,
	});

	// Selected member state
	const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
	const [selectedRole, setSelectedRole] = useState<Role>(Role.VIEWER);

	// Queries
	const organizationQuery = useQuery(
		trpc.organizations.getById.queryOptions({ organizationId: id }),
	);

	const membersQuery = useQuery(
		trpc.organizations.listMembers.queryOptions(
			{ organizationId: id },
			// Only run this query when we have organization data and when we're on this page
			{ enabled: !!organizationQuery.data && !organizationQuery.error },
		),
	);

	// Dialog handling
	const closeDialog = useCallback((dialogName: keyof typeof dialogState) => {
		setDialogState((prev) => ({ ...prev, [dialogName]: false }));
	}, []);

	const openDialog = useCallback((dialogName: keyof typeof dialogState) => {
		setDialogState((prev) => ({ ...prev, [dialogName]: true }));
	}, []);

	const handleOpenChangeRole = useCallback(
		(userId: number, currentRole: Role) => {
			setSelectedMemberId(userId);
			setSelectedRole(currentRole);
			openDialog("changeMemberRole");
		},
		[openDialog],
	);

	const handleOpenRemoveMember = useCallback(
		(userId: number) => {
			setSelectedMemberId(userId);
			openDialog("removeMember");
		},
		[openDialog],
	);

	const handleEditName = useCallback(
		(name: string) => {
			operations.editName(name, () => closeDialog("editName"));
		},
		[operations, closeDialog],
	);

	const handleAddMember = useCallback(
		(email: string, role: Role) => {
			operations.addMember(email, role, () => closeDialog("addMember"));
		},
		[operations, closeDialog],
	);

	const handleChangeMemberRole = useCallback(
		(newRole: Role) => {
			if (selectedMemberId === null) return;
			operations.changeMemberRole(
				selectedMemberId,
				newRole,
				membersQuery.data,
				() => closeDialog("changeMemberRole"),
			);
		},
		[selectedMemberId, operations, membersQuery.data, closeDialog],
	);

	const handleRemoveMember = useCallback(() => {
		if (selectedMemberId === null) return;
		operations.removeMember(selectedMemberId, membersQuery.data, () =>
			closeDialog("removeMember"),
		);
	}, [selectedMemberId, operations, membersQuery.data, closeDialog]);

	const renderContent = useCallback(
		(organization: Organization) => {
			return (
				<>
					{/* Organization Details Card */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Organization Details</CardTitle>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => openDialog("editName")}
									aria-label="Edit organization name"
								>
									<Edit className="h-4 w-4 mr-2" />
									Edit Name
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => openDialog("deleteOrg")}
									aria-label="Delete organization"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Organization
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4">
								<div>
									<Label>Name</Label>
									<div className="text-lg font-medium">
										{organization?.name}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Members Card */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Members</CardTitle>
							<Button
								size="sm"
								onClick={() => openDialog("addMember")}
								aria-label="Add member"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Member
							</Button>
						</CardHeader>
						<CardContent>
							<DynamicContent
								data={membersQuery.data}
								isPending={membersQuery.isPending}
								error={membersQuery.error}
								renderContent={(members) => (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>User</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Role</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{members.map((member) => (
												<MemberRow
													key={member.userId}
													member={member}
													isLastAdmin={operations.isLastAdmin(
														members,
														member.userId,
													)}
													onChangeRole={handleOpenChangeRole}
													onRemove={handleOpenRemoveMember}
												/>
											))}
										</TableBody>
									</Table>
								)}
							/>
						</CardContent>
					</Card>
				</>
			);
		},
		[
			operations,
			membersQuery,
			handleOpenChangeRole,
			handleOpenRemoveMember,
			openDialog,
		],
	);

	return (
		<>
			<EditNameDialog
				isOpen={dialogState.editName}
				onClose={() => closeDialog("editName")}
				initialName={organizationQuery.data?.name || ""}
				onSubmit={handleEditName}
				isSubmitting={mutations.editOrganizationMutation.isPending}
			/>

			<AddMemberDialog
				isOpen={dialogState.addMember}
				onClose={() => closeDialog("addMember")}
				onSubmit={handleAddMember}
				isSubmitting={mutations.addMemberMutation.isPending}
			/>

			<ChangeMemberRoleDialog
				isOpen={dialogState.changeMemberRole}
				onClose={() => closeDialog("changeMemberRole")}
				initialRole={selectedRole}
				onSubmit={handleChangeMemberRole}
				isSubmitting={mutations.changeMemberRoleMutation.isPending}
			/>

			<ConfirmationDialog
				isOpen={dialogState.removeMember}
				onClose={() => closeDialog("removeMember")}
				title="Remove Member"
				message="Are you sure you want to remove this member from the organization?"
				confirmLabel="Remove"
				onConfirm={handleRemoveMember}
				isConfirming={mutations.removeMemberMutation.isPending}
				variant="destructive"
			/>

			<ConfirmationDialog
				isOpen={dialogState.deleteOrg}
				onClose={() => closeDialog("deleteOrg")}
				title="Delete Organization"
				message="Are you sure you want to delete this organization? This action cannot be undone."
				confirmLabel="Delete"
				onConfirm={operations.deleteOrganization}
				isConfirming={mutations.deleteOrganizationMutation.isPending}
				variant="destructive"
			/>

			<Layout title="Organization Settings">
				<div className="space-y-8">
					<DynamicContent
						{...organizationQuery}
						renderContent={renderContent}
					/>
					<AlertSources organizationId={id} />
				</div>
			</Layout>
		</>
	);
};
