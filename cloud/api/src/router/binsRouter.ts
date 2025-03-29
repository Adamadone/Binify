import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure } from "../auth/trpcAuth";
import {
	activateBin,
	createBin,
	listBinsWithActivatedBinsAndOrganizations,
} from "../core/bins";
import { router } from "../libs/trpc";

export const binsRouter = router({
	create: authenticatedProcedure.mutation(async ({ ctx }) =>
		(await createBin(ctx.user)).match(
			(bin) => bin,
			(err) => {
				switch (err) {
					case "userIsNotSuperAdmin":
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You are not a super admin",
						});
					case "failedToGenerateActivationCode":
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to generate activation code",
						});
					default:
						return err satisfies never;
				}
			},
		),
	),
	list: authenticatedProcedure
		.input(
			z.object({
				page: z.number().default(0),
				pageSize: z.number().default(50),
			}),
		)
		.query(async ({ input, ctx }) =>
			(await listBinsWithActivatedBinsAndOrganizations(input, ctx.user)).match(
				(result) => result,
				(err) => {
					switch (err) {
						case "userIsNotSuperAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not a super admin",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
	activate: authenticatedProcedure
		.input(
			z.object({
				activationCode: z.string(),
				binName: z.string(),
				organizationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			(await activateBin(input, ctx.user)).match(
				(result) => result,
				(err) => {
					switch (err) {
						case "binNotFound":
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Bin not found",
							});
						case "organizationNotFound":
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Organization not found",
							});
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not organization admin",
							});
						case "binAlreadyActivated":
							throw new TRPCError({
								code: "CONFLICT",
								message: "Bin was already activated",
							});
						default:
							return err satisfies never;
					}
				},
			);
		}),
});
