import { trpc } from "@/libs/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { enqueueSnackbar } from "notistack";
import { useCallback } from "react";
import {
	type Member,
	Role,
} from "../pages/authenticated/OrganizationPage/types";

const isLastAdmin = (
	members: Member[] | undefined,
	memberId: number,
): boolean => {
	if (!members) return false;

	const adminCount = members.filter((m) => m.role === Role.ADMIN).length;

	const isMemberAdmin =
		members.find((m) => m.userId === memberId)?.role === Role.ADMIN;

	return adminCount === 1 && isMemberAdmin;
};

export const useOrganizationOperations = (organizationId: number) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// mutations
	const editOrganizationMutation = useMutation(
		trpc.organizations.update.mutationOptions(),
	);

	const deleteOrganizationMutation = useMutation(
		trpc.organizations.delete.mutationOptions(),
	);

	const addMemberMutation = useMutation(
		trpc.organizations.addMember.mutationOptions(),
	);

	const changeMemberRoleMutation = useMutation(
		trpc.organizations.changeMemberRole.mutationOptions(),
	);

	const removeMemberMutation = useMutation(
		trpc.organizations.removeMember.mutationOptions(),
	);

	// helper for invalidating queries
	const invalidateOrgQueries = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: trpc.organizations.getById.pathKey(),
		});
		queryClient.invalidateQueries({
			queryKey: trpc.organizations.listMembers.pathKey(),
		});
	}, [queryClient]);

	// operations
	const editName = useCallback(
		(name: string, onSuccess?: () => void) => {
			editOrganizationMutation.mutate(
				{ id: organizationId, name },
				{
					onSuccess: () => {
						invalidateOrgQueries();
						enqueueSnackbar({
							variant: "success",
							message: "Organization name updated",
						});
						onSuccess?.();
					},
					onError: () => {
						enqueueSnackbar({
							variant: "error",
							message: "Failed to update organization name",
						});
					},
				},
			);
		},
		[organizationId, editOrganizationMutation, invalidateOrgQueries],
	);

	const deleteOrganization = useCallback(() => {
		deleteOrganizationMutation.mutate(
			{ organizationId },
			{
				onSuccess: () => {
					enqueueSnackbar({
						variant: "success",
						message: "Organization deleted",
					});
					navigate({ to: "/" });
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to delete organization",
					});
				},
			},
		);
	}, [organizationId, deleteOrganizationMutation, navigate]);

	const addMember = useCallback(
		(email: string, role: Role, onSuccess?: () => void) => {
			addMemberMutation.mutate(
				{ organizationId, email, role },
				{
					onSuccess: () => {
						invalidateOrgQueries();
						enqueueSnackbar({
							variant: "success",
							message: "Member added successfully",
						});
						onSuccess?.();
					},
					onError: (error) => {
						let message = "Failed to add member";

						if (error instanceof Error) {
							message = error.message;
						}

						enqueueSnackbar({
							variant: "error",
							message,
						});
					},
				},
			);
		},
		[organizationId, addMemberMutation, invalidateOrgQueries],
	);

	const changeMemberRole = useCallback(
		(
			userId: number,
			role: Role,
			members: Member[] | undefined,
			onSuccess?: () => void,
		) => {
			if (!members) return;

			if (isLastAdmin(members, userId) && role === Role.VIEWER) {
				enqueueSnackbar({
					variant: "error",
					message: "Cannot downgrade the last admin to viewer",
				});
				return;
			}

			changeMemberRoleMutation.mutate(
				{ organizationId, userId, role },
				{
					onSuccess: () => {
						invalidateOrgQueries();
						enqueueSnackbar({
							variant: "success",
							message: "Member role updated",
						});
						onSuccess?.();
					},
					onError: () => {
						enqueueSnackbar({
							variant: "error",
							message: "Failed to update member role",
						});
					},
				},
			);
		},
		[organizationId, changeMemberRoleMutation, invalidateOrgQueries],
	);

	const removeMember = useCallback(
		(userId: number, members: Member[] | undefined, onSuccess?: () => void) => {
			if (!members) return;

			if (isLastAdmin(members, userId)) {
				enqueueSnackbar({
					variant: "error",
					message: "Cannot remove the last admin from the organization",
				});
				return;
			}

			removeMemberMutation.mutate(
				{ organizationId, userId },
				{
					onSuccess: () => {
						invalidateOrgQueries();
						enqueueSnackbar({
							variant: "success",
							message: "Member removed",
						});
						onSuccess?.();
					},
					onError: () => {
						enqueueSnackbar({
							variant: "error",
							message: "Failed to remove member",
						});
					},
				},
			);
		},
		[organizationId, removeMemberMutation, invalidateOrgQueries],
	);

	return {
		mutations: {
			editOrganizationMutation,
			deleteOrganizationMutation,
			addMemberMutation,
			changeMemberRoleMutation,
			removeMemberMutation,
		},
		operations: {
			editName,
			deleteOrganization,
			addMember,
			changeMemberRole,
			removeMember,
			isLastAdmin,
		},
	};
};
