import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure } from "../auth/trpcAuth";
import {
	addMemberToOrganization,
	changeMemberRole,
	createOrganization,
	deleteOrganization,
	getOrganizationById,
	listOrganizationMembers,
	listOrganizationsForCurrentUser,
	removeMemberFromOrganization,
	updateOrganization,
} from "../core/organizations";
import { router } from "../libs/trpc";

export const organizationsRouter = router({
	create: authenticatedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(({ input, ctx }) => createOrganization(input.name, ctx.user)),

	update: authenticatedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
				alertThresholdPercent: z.number().min(0).max(100).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) =>
			(await updateOrganization(input, ctx.user)).match(
				(organization) => organization,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin in this organization",
							});
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	delete: authenticatedProcedure
		.input(z.object({ organizationId: z.number() }))
		.mutation(async ({ input, ctx }) =>
			(await deleteOrganization(input.organizationId, ctx.user)).match(
				(_) => null,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin in this organization",
							});
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	addMember: authenticatedProcedure
		.input(
			z.object({
				organizationId: z.number(),
				email: z.string().email(),
				role: z.enum(["ADMIN", "VIEWER"]),
			}),
		)
		.mutation(async ({ input, ctx }) =>
			(
				await addMemberToOrganization(
					{
						email: input.email,
						organizationId: input.organizationId,
						role: input.role,
					},
					ctx.user,
				)
			).match(
				(member) => ({ member }),
				(err) => {
					switch (err) {
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin in this organization",
							});
						case "userDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "No user found with that email address",
							});
						case "userIsAlreadyMember":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "This user is already a member of the organization",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	changeMemberRole: authenticatedProcedure
		.input(
			z.object({
				userId: z.number(),
				organizationId: z.number(),
				role: z.enum(["ADMIN", "VIEWER"]),
			}),
		)
		.mutation(async ({ input, ctx }) =>
			(await changeMemberRole(input, ctx.user)).match(
				(member) => member,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin in this organization",
							});
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						case "userIsNotMember":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The user is not a member",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	removeMember: authenticatedProcedure
		.input(
			z.object({
				userId: z.number(),
				organizationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			(await removeMemberFromOrganization(input, ctx.user)).match(
				(_) => null,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdminAndIsNotSameUser":
							throw new TRPCError({
								code: "FORBIDDEN",
								message:
									"You are not admin in this organization and you are not the same user",
							});
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						case "userIsNotMember":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The user is not a member",
							});
						case "cannotRemoveLastAdmin":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "Cannot remove last admin",
							});
						default:
							return err satisfies never;
					}
				},
			);
		}),

	listForCurrentUser: authenticatedProcedure.query(({ ctx }) =>
		listOrganizationsForCurrentUser(ctx.user),
	),

	getById: authenticatedProcedure
		.input(z.object({ organizationId: z.number() }))
		.query(async ({ input, ctx }) =>
			(await getOrganizationById(input.organizationId, ctx.user)).match(
				(organization) => organization,
				(err) => {
					switch (err) {
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						case "userIsNotOrganizationMember":
							throw new TRPCError({
								code: "UNAUTHORIZED",
								message: "You are not a member of this organization",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	listMembers: authenticatedProcedure
		.input(z.object({ organizationId: z.number() }))
		.query(async ({ input, ctx }) =>
			(await listOrganizationMembers(input.organizationId, ctx.user)).match(
				(members) => members,
				(err) => {
					switch (err) {
						case "organizationDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The organization doesn't exist",
							});
						case "userIsNotOrganizationMember":
							throw new TRPCError({
								code: "UNAUTHORIZED",
								message: "You are not a member of this organization",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
});
