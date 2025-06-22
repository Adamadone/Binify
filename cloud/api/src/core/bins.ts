import { type Bin, type Measurement, Prisma, type User } from "@prisma/client";
import { err, ok, okAsync } from "neverthrow";
import { v4 as uuid } from "uuid";
import { logger } from "../libs/pino";
import { prismaClient } from "../libs/prisma";
import { calculcatePercentage } from "../utils/calculatePercentage";

const MAX_CODE_GENERATION_RUNS = 100;
const MAX_STATISTICS_INTERVALS = 100;

export const createBin = async (currentUser: User) => {
	if (!currentUser.isSuperAdmin) return err("userIsNotSuperAdmin");

	const deviceId = uuid();
	logger.info({ deviceId }, "Creating bin");

	const insert = async () => {
		try {
			const activationCode = new Array(6)
				.fill(0)
				.map(() => Math.floor(Math.random() * 10))
				.join("");
			const bin = await prismaClient.bin.create({
				data: { deviceId, activationCode },
			});
			return okAsync(bin);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				// Constraint violation
				error.code === "P2002"
			) {
				return err();
			}
			throw error;
		}
	};

	let bin: Bin | null = null;
	for (let i = 0; i < MAX_CODE_GENERATION_RUNS && bin === null; i++) {
		logger.debug({ tryIndex: i }, "Trying to insert bin");
		bin = (await insert()).unwrapOr(null);
	}

	if (bin === null) {
		logger.error("Failed to genereate activation code for bin");
		return err("failedToGenerateActivationCode");
	}

	logger.info("Bin created");
	return ok(bin);
};

export type ListBinsWithActivatedBinsAndOrganizationsParams = {
	page: number;
	pageSize: number;
};
export const listBinsWithActivatedBinsAndOrganizations = async (
	{ page, pageSize }: ListBinsWithActivatedBinsAndOrganizationsParams,
	currentUser: User,
) => {
	if (!currentUser.isSuperAdmin) return err("userIsNotSuperAdmin");

	const [bins, totalCount] = await Promise.all([
		prismaClient.bin.findMany({
			skip: page * pageSize,
			take: pageSize,
			include: { activatedBin: { include: { organization: true } } },
		}),
		prismaClient.bin.count(),
	]);

	return ok({
		bins,
		totalCount,
	});
};

type ActivateBinParams = {
	activationCode: string;
	binName: string;
	organizationId: number;
};

export const activateBin = async (
	{ activationCode, binName, organizationId }: ActivateBinParams,
	currentUser: User,
) => {
	const organization = await prismaClient.organization.findUnique({
		where: {
			id: organizationId,
		},
		include: {
			members: {
				where: {
					userId: currentUser.id,
					role: "ADMIN",
				},
			},
		},
	});
	if (!organization) return err("organizationNotFound");
	if (organization.members.length === 0) return err("currentUserIsNotAdmin");

	return prismaClient.$transaction(async (tx) => {
		const bin = await tx.bin.findUnique({
			where: { activationCode: activationCode },
			include: { activatedBin: true },
		});
		if (!bin) return err("binNotFound");
		if (bin.activatedBin) return err("binAlreadyActivated");

		const createdBin = await tx.activatedBin.create({
			data: {
				activatedAt: new Date(),
				name: binName,
				binId: bin.id,
				organizationId: organizationId,
			},
		});
		return ok(createdBin);
	});
};

export const deactivateBin = async (
	activatedBinId: number,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const activatedBin = await tx.activatedBin.findUnique({
			where: { id: activatedBinId },
			include: {
				organization: {
					include: {
						members: { where: { userId: currentUser.id, role: "ADMIN" } },
					},
				},
			},
		});
		if (!activatedBin) return err("binDoesNotExist");
		if (activatedBin.organization.members.length === 0)
			return err("currentUserIsNotAdmin");

		await tx.activatedBin.delete({ where: { id: activatedBin.id } });
		return ok();
	});

export type ListActivatedBinsForOrganizationParams = {
	organizationId: number;
	page: number;
	pageSize: number;
};
export const listActivatedBinsForOrganization = async (
	{ organizationId, page, pageSize }: ListActivatedBinsForOrganizationParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
			include: {
				members: { where: { userId: currentUser.id } },
			},
		});
		if (!organization) return err("organizationDoesNotExist");
		if (organization.members.length === 0) return err("currentUserIsNotMember");

		const [bins, totalCount] = await Promise.all([
			tx.activatedBin.findMany({
				where: { organizationId },
				take: pageSize,
				skip: pageSize * page,
				orderBy: { activatedAt: "asc" },
			}),
			tx.activatedBin.count({ where: { organizationId } }),
		]);
		return ok({ bins, totalCount });
	});

export type ImportBinBatchMeasurementsParams = {
	devices: {
		deviceId: string;
		measurements: {
			measuredAt: Date;
			distanceCentimeters: number;
			airQualityPpm: number;
		}[];
	}[];
};
export const importBinBatchMeasurements = ({
	devices,
}: ImportBinBatchMeasurementsParams) => {
	const promises = devices.map(async (device) => {
		prismaClient.$transaction(async (tx) => {
			const activatedBin = await tx.activatedBin.findFirst({
				where: { bin: { deviceId: device.deviceId } },
			});
			if (!activatedBin) {
				logger.warn(
					{ deviceId: device.deviceId },
					"Device wasn't activated or doesn't exist. Skipping.",
				);
				return;
			}

			const data = device.measurements.map<Measurement>((measurement) => ({
				...measurement,
				activatedBinId: activatedBin.id,
			}));
			await tx.measurement.createMany({ data, skipDuplicates: true });
		});
	});

	return Promise.all(promises);
};

export type GetBinStatisticsParams = {
	from: Date;
	to: Date;
	groupByMinutes: number;
	activatedBindId: number;
};
export type BinStatisticInterval = {
	intervalStart: Date;
	maxDistanceCentimeters: number;
	maxFulnnessPercentage: number;
	minDistanceCentimeters: number;
	minFulnnessPercentage: number;
	avgDistanceCentimeters: number;
	avgFulnessPercentage: number;
	maxAirQualityPpm: number;
	minAirQualityPpm: number;
	avgAirQualityPpm: number;
};
export type BinStatistic = {
	maxDistanceCentimeters: number;
	intervals: BinStatisticInterval[];
};
type BinStatisticIntervalRaw = {
	intervalStart: string;
	maxDistanceCentimeters: number;
	minDistanceCentimeters: number;
	avgDistanceCentimeters: number;
	globalMaxDistanceCentimeters: number;
	maxAirQualityPpm: number;
	minAirQualityPpm: number;
	avgAirQualityPpm: number;
};
export const getBinStatistics = async (
	{ from, to, groupByMinutes, activatedBindId }: GetBinStatisticsParams,
	currentUser: User,
) => {
	const intervalMinutes = (to.getTime() - from.getTime()) / (1_000 * 60);
	const numberOfIntervals = Math.ceil(intervalMinutes / groupByMinutes);
	logger.info(
		{ intervalMinutes, numberOfGroups: numberOfIntervals },
		"getBinStatics called",
	);
	if (numberOfIntervals > MAX_STATISTICS_INTERVALS) return err("tooManyGroups");

	const currentMember = await prismaClient.member.findFirst({
		where: {
			userId: currentUser.id,
			organization: { bins: { some: { id: activatedBindId } } },
		},
	});
	if (!currentMember) return err("currentUserIsNotMember");

	const statisticsRaw = await prismaClient.$queryRaw<BinStatisticIntervalRaw[]>`
			select time_bucket((${groupByMinutes} || ' minutes')::interval, "measuredAt", ${from}) as "intervalStart",
		    max("distanceCentimeters") as "maxDistanceCentimeters",
		    min("distanceCentimeters") as "minDistanceCentimeters",
		    round(avg("distanceCentimeters"))::integer as "avgDistanceCentimeters",
		    (select max("distanceCentimeters") from "Measurement" where "activatedBinId" = ${activatedBindId} ) as "globalMaxDistanceCentimeters",
		    max("airQualityPpm") as "maxAirQualityPpm",
		    min("airQualityPpm") as "minAirQualityPpm",
		    round(avg("airQualityPpm"))::integer as "avgAirQualityPpm"
		  from "Measurement"
		  where "activatedBinId" = ${activatedBindId} and "measuredAt" >= ${from} and "measuredAt" <= ${to}
		  group by "intervalStart"
		  order by "intervalStart" desc;
	`;
	const globalMaxDistanceCentimeters =
		statisticsRaw[0]?.globalMaxDistanceCentimeters ?? 0;
	const statistics = statisticsRaw.map<BinStatisticInterval>((entry) => ({
		intervalStart: new Date(entry.intervalStart),
		maxDistanceCentimeters: entry.maxDistanceCentimeters,
		maxFulnnessPercentage:
			100 -
			calculcatePercentage(
				entry.maxDistanceCentimeters,
				globalMaxDistanceCentimeters,
			),
		minDistanceCentimeters: entry.minDistanceCentimeters,
		minFulnnessPercentage:
			100 -
			calculcatePercentage(
				entry.minDistanceCentimeters,
				globalMaxDistanceCentimeters,
			),
		avgDistanceCentimeters: entry.avgDistanceCentimeters,
		avgFulnessPercentage:
			100 -
			calculcatePercentage(
				entry.avgDistanceCentimeters,
				globalMaxDistanceCentimeters,
			),
		maxAirQualityPpm: entry.maxAirQualityPpm,
		minAirQualityPpm: entry.minAirQualityPpm,
		avgAirQualityPpm: entry.avgAirQualityPpm,
	}));
	return ok<BinStatistic>({
		maxDistanceCentimeters: globalMaxDistanceCentimeters,
		intervals: statistics,
	});
};
