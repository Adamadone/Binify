import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure } from "../auth/trpcAuth";
import {
	type ImportBinBatchMeasurementsParams,
	activateBin,
	createBin,
	deactivateBin,
	getBinStatistics,
	importBinBatchMeasurements,
	listActivatedBinsForOrganization,
	listBinsWithActivatedBinsAndOrganizations,
} from "../core/bins";
import { procedure, router } from "../libs/trpc";

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
		.mutation(async ({ input, ctx }) =>
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
			),
		),

	deactivate: authenticatedProcedure
		.input(z.object({ activatedBinId: z.number() }))
		.mutation(async ({ input, ctx }) =>
			(await deactivateBin(input.activatedBinId, ctx.user)).match(
				(_) => null,
				(err) => {
					switch (err) {
						case "currentUserIsNotAdmin":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not admin",
							});
						case "binDoesNotExist":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "The bin doesn't exist",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
	listActivatedForOrganization: authenticatedProcedure
		.input(
			z.object({
				organizationId: z.number(),
				page: z.number().default(0),
				pageSize: z.number().default(50),
			}),
		)
		.query(async ({ input, ctx }) =>
			(await listActivatedBinsForOrganization(input, ctx.user)).match(
				(result) => result,
				(err) => {
					switch (err) {
						case "currentUserIsNotMember":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not member",
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
	importBatchMeasurements: procedure
		.input(
			z.object({
				devices: z.array(
					z.object({
						deviceId: z.string(),
						measurements: z.array(
							z.object({
								measuredAt: z.string().datetime(),
								distanceCentimeters: z.number().positive(),
								airQualityPpm: z.number().positive().max(1_000_000),
							}),
						),
					}),
				),
			}),
		)

		.mutation(async ({ input }) => {
			const devices: ImportBinBatchMeasurementsParams["devices"] =
				input.devices.map((device) => ({
					...device,
					measurements: device.measurements.map((measurement) => ({
						...measurement,
						measuredAt: new Date(measurement.measuredAt),
					})),
				}));
			importBinBatchMeasurements({ devices });
		}),
	statistics: authenticatedProcedure
		.input(
			z.object({
				activatedBinId: z.number(),
				from: z.string().datetime(),
				to: z.string().datetime(),
				groupByMinutes: z.number(),
			}),
		)
		.query(async ({ input, ctx }) =>
			(
				await getBinStatistics(
					{
						activatedBindId: input.activatedBinId,
						from: new Date(input.from),
						to: new Date(input.to),
						groupByMinutes: input.groupByMinutes,
					},
					ctx.user,
				)
			).match(
				(statistics) => statistics,
				(err) => {
					switch (err) {
						case "currentUserIsNotMember":
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "You are not a member",
							});
						case "tooManyGroups":
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "This request would result in too many groups/points",
							});
						default:
							return err satisfies never;
					}
				},
			),
		),
});
