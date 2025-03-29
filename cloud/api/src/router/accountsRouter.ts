import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure } from "../auth/trpcAuth";
import {
	demoteUserFromSuperAdmin,
	listSuperAdmins,
	makeUserSuperAdmin,
} from "../core/accounts";
import { router } from "../libs/trpc";

export const accountsRouter = router({
	me: authenticatedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
	makeUserSuperAdmin: authenticatedProcedure
		.input(z.object({ email: z.string() }))
		.mutation(async ({ input, ctx }) =>
			(await makeUserSuperAdmin(input.email, ctx.user)).match(
				(user) => user,
				(err) => {
					switch (err) {
						case "currentUserIsNotSuperAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not super admin",
							});
						case "userDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "User doesn't exist",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
	demoteUserFromSuperAdmin: authenticatedProcedure
		.input(z.object({ userId: z.number() }))
		.mutation(async ({ input, ctx }) =>
			(await demoteUserFromSuperAdmin(input.userId, ctx.user)).match(
				(user) => user,
				(err) => {
					switch (err) {
						case "currentUserIsNotSuperAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not super admin",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
	listSuperAdmins: authenticatedProcedure.query(async ({ ctx }) =>
		(await listSuperAdmins(ctx.user)).match(
			(superAdmins) => superAdmins,
			(err) => {
				switch (err) {
					case "currentUserIsNotSuperAdmin":
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You are not super admin",
						});
					default:
						return err satisfies never;
				}
			},
		),
	),
});
