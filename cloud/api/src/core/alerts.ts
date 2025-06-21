import type { ActivatedBin, User } from "@prisma/client";
import { err, ok } from "neverthrow";
import { validate as validateUuid } from "uuid";
import { prismaClient } from "../libs/prisma";

export type CreateAlertSourceParams = {
	organizationId: number;
	name: string;
	thresholdPercent: number;
	repeatMinutes?: number;
};
export const createTelegramAlertSource = (
	{
		organizationId,
		name,
		thresholdPercent,
		repeatMinutes,
	}: CreateAlertSourceParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: { userId: currentUser.id, organizationId },
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const createdAlertSource = await prismaClient.alertSource.create({
			data: {
				organizationId,
				name,
				thresholdPercent,
				repeatMinutes,
				telegramAlertSource: {
					create: {},
				},
			},
			include: {
				telegramAlertSource: true,
			},
		});
		return ok(createdAlertSource);
	});

export const deleteAlertSource = (id: number, currentUser: User) =>
	prismaClient.$transaction(async (tx) => {
		const alertSource = await tx.alertSource.findUnique({ where: { id } });
		if (!alertSource) return err("alertSourceNotFound");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: alertSource.organizationId,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		await tx.alertSource.delete({ where: { id } });
		return ok();
	});

export type UpdateAlertSourceParams = {
	id: number;
	name?: string;
	thresholdPercent?: number;
	repeatMinutes?: number | null;
};
export const updateAlertSource = (
	{ id, name, thresholdPercent, repeatMinutes }: UpdateAlertSourceParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const alertSource = await tx.alertSource.findUnique({ where: { id } });
		if (!alertSource) return err("alertSourceNotFound");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: alertSource.organizationId,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const updated = await tx.alertSource.update({
			where: { id },
			data: { name, thresholdPercent, repeatMinutes },
			include: { telegramAlertSource: true },
		});
		return ok(updated);
	});

export const listOrganizationAlertSources = (
	organizationId: number,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: { organizationId, userId: currentUser.id },
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const alertSources = await tx.alertSource.findMany({
			where: { organizationId },
			include: { telegramAlertSource: true },
			orderBy: { id: "asc" },
		});
		return ok(alertSources);
	});

export type ListOrganizationSentAlertsParams = {
	organizationId: number;
	page: number;
	pageSize: number;
	filter: { binId?: number; fromDate?: Date; toDate?: Date };
};
export const listOrganizationSentAlerts = (
	{ organizationId, page, pageSize, filter }: ListOrganizationSentAlertsParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: { organizationId, userId: currentUser.id },
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const [sentAlerts, totalCount] = await Promise.all([
			prismaClient.sentAlert.findMany({
				skip: page * pageSize,
				take: pageSize,
				where: {
					alertSource: { organizationId },
					activatedBin: { binId: filter.binId },
					at: { gte: filter.fromDate, lte: filter.toDate },
				},
				include: {
					alertSource: { include: { telegramAlertSource: true } },
					activatedBin: true,
				},
			}),
			prismaClient.sentAlert.count({
				where: { alertSource: { organizationId } },
			}),
		]);

		return ok({ sentAlerts, totalCount });
	});

export type ActivateTelegramAlertSourceParams = {
	activationCode: string;
	chatId: string;
	title?: string;
	firstName?: string;
	lastName?: string;
	username?: string;
};
export const activateTelegramAlertSource = async ({
	activationCode,
	chatId,
	title,
	firstName,
	lastName,
	username,
}: ActivateTelegramAlertSourceParams) => {
	const isActivationCodeValid = validateUuid(activationCode);
	if (!isActivationCodeValid) return err("invalidActivationCode");

	const finalUsername: string =
		username ||
		(firstName && lastName && `${firstName} ${lastName}`) ||
		title ||
		firstName ||
		lastName ||
		"?";

	return await prismaClient.$transaction(async (tx) => {
		const alertSource = await tx.telegramAlertSource.findUnique({
			where: { activationCode },
		});
		if (!alertSource) return err("alertSourceNotFound");

		await tx.telegramAlertSource.update({
			where: { activationCode },
			data: { chatId, username: finalUsername },
		});
		return ok();
	});
};

export type BinToAlert = ActivatedBin & {
	alertSourceId: number;
	thresholdPercent: number;
	currentPercent: number;
};

export const listBinsToAlert = () =>
	prismaClient.$queryRaw<BinToAlert[]>`
		WITH
			latestMeasurements AS (
				SELECT
					top.*
				FROM
					"Measurement" top
					INNER JOIN (
						SELECT
							"activatedBinId",
							MAX("measuredAt") AS "measuredAt"
						FROM
							"Measurement"
						GROUP BY
							"activatedBinId"
					) nested ON nested."activatedBinId" = top."activatedBinId"
					AND nested."measuredAt" = top."measuredAt"
			),
			maxDistances AS (
				SELECT
					"activatedBinId",
					MAX("distanceCentimeters") AS "distanceCentimeters"
				FROM
					"Measurement"
				GROUP BY
					"activatedBinId"
			),
			thresholds AS (
				SELECT
					activatedBin.id AS "activatedBinId",
					(SELECT alertSource.id) as  "alertSourceId",
					(
						SELECT
							maxDistance."distanceCentimeters" * alertSource."thresholdPercent" / 100
					) AS threshold,
					(SELECT alertSource."thresholdPercent") as "thresholdPercent"
				FROM
					"ActivatedBin" activatedBin
				INNER JOIN "Organization" organization ON organization.id = activatedBin."organizationId"
					INNER JOIN "AlertSource" alertSource ON alertSource."organizationId" = organization.id
					INNER JOIN maxDistances maxDistance ON maxDistance."activatedBinId" = activatedBin.id
			),
			lastSentAlerts AS (
				SELECT
					"activatedBinId",
					"alertSourceId",
					MAX("at") AS "at"
				FROM
					"SentAlert"
				GROUP BY
					"activatedBinId",
					"alertSourceId"
			)
		SELECT
			activatedBin.*,
			alertSource.id AS "alertSourceId",
			threshold."thresholdPercent" as "thresholdPercent",
			(
				SELECT
					latestMeasurement."distanceCentimeters" * 100 / maxDistance."distanceCentimeters"
			) AS "currentPercent"
		FROM
			"ActivatedBin" activatedBin
		INNER JOIN latestMeasurements latestMeasurement ON latestMeasurement."activatedBinId" = activatedBin.id
			INNER JOIN "AlertSource" alertSource ON alertSource."organizationId" = activatedBin."organizationId"
			INNER JOIN thresholds threshold ON threshold."activatedBinId" = activatedBin.id AND threshold."alertSourceId" = alertSource."id"
			INNER JOIN maxDistances maxDistance on maxDistance."activatedBinId" = activatedBin.id
			LEFT JOIN lastSentAlerts lastSentAlert ON lastSentAlert."activatedBinId" = activatedBin.id
			AND lastSentAlert."alertSourceId" = alertSource.id
		WHERE
			-- Is now above threshold?
			latestMeasurement."distanceCentimeters" >= threshold.threshold
			AND (
				(
					-- Was the measurement under threshold since last alert?
					EXISTS (
						SELECT
							*
						FROM
							"Measurement" measurement
						WHERE
							measurement."distanceCentimeters" < (threshold.threshold)
							AND measurement."measuredAt" > (lastSentAlert.at)
							AND measurement."measuredAt" < (latestMeasurement."measuredAt")
					)
				)
				-- Should repeat alert?
				OR (
					alertSource."repeatMinutes" IS NOT NULL
					AND lastSentAlert.at + interval '1  minute' * alertSource."repeatMinutes" <= ${new Date()}
				)
				-- Was alert never sent?
				OR lastSentAlert IS NULL
			);		
	`;

export type SaveSentAlertParams = {
	alertSourceId: number;
	activatedBinId: number;
};
export const saveSentAlert = ({
	alertSourceId,
	activatedBinId,
}: SaveSentAlertParams) =>
	prismaClient.sentAlert.create({
		data: {
			at: new Date(),
			alertSourceId,
			activatedBinId,
		},
	});

export const listAlertSourcesByIds = (ids: number[]) =>
	prismaClient.alertSource.findMany({
		where: { id: { in: ids } },
		include: { telegramAlertSource: true },
	});
