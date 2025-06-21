import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure } from "../auth/trpcAuth";
import {
	createTelegramAlertSource,
	deleteAlertSource,
	listOrganizationAlertSources,
	listOrganizationSentAlerts,
	updateAlertSource,
} from "../core/alerts";
import { router } from "../libs/trpc";

export const alertsRouter = router({
	createTelegramAlertSource: authenticatedProcedure
		.input(
			z.object({
				organizationId: z.number(),
				name: z.string(),
				thresholdPercent: z.number().positive().max(100),
				repeatMinutes: z.number().positive().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) =>
			(await createTelegramAlertSource(input, ctx.user)).match(
				(alertSource) => alertSource,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	deleteAlertSource: authenticatedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) =>
			(await deleteAlertSource(input.id, ctx.user)).match(
				(_ok) => null,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});
						case "alertSourceNotFound":
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Alert source not found",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	updateAlertSource: authenticatedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().optional(),
				thresholdPercent: z.number().positive().max(100),
				repeatMinutes: z.number().positive().optional().nullable(),
			}),
		)
		.mutation(async ({ input, ctx }) =>
			(await updateAlertSource(input, ctx.user)).match(
				(updated) => updated,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});
						case "alertSourceNotFound":
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Alert source not found",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	listOrganizationAlertSources: authenticatedProcedure
		.input(z.object({ organizationId: z.number() }))
		.query(async ({ input, ctx }) =>
			(
				await listOrganizationAlertSources(input.organizationId, ctx.user)
			).match(
				(list) => list,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),

	listOrganizationSentAlerts: authenticatedProcedure
		.input(
			z.object({
				organizationId: z.number(),
				page: z.number().default(0),
				pageSize: z.number().default(50),
				filter: z
					.object({
						binId: z.number().optional(),
						fromDate: z.string().datetime().optional(),
						toDate: z.string().datetime().optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ input, ctx }) =>
			(
				await listOrganizationSentAlerts(
					{
						...input,
						filter: {
							...input.filter,
							fromDate: input.filter?.fromDate
								? new Date(input.filter.fromDate)
								: undefined,
							toDate: input.filter?.toDate
								? new Date(input.filter.toDate)
								: undefined,
						},
					},
					ctx.user,
				)
			).match(
				(sentAlerts) => sentAlerts,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});

						default:
							return err satisfies never;
					}
				},
			),
		),
});
