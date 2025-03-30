import type { User } from "@prisma/client";
import { err, ok } from "neverthrow";
import { env } from "../env";
import { prismaClient } from "../libs/prisma";

export const findUser = (id: number) =>
	prismaClient.user.findUnique({ where: { id } });

type UpsertMicrosoftUserParams = {
	id: string;
	email: string;
	name: string;
};

export const upsertMicrosoftLogin = ({
	id,
	email,
	name,
}: UpsertMicrosoftUserParams) =>
	prismaClient.$transaction(async (tx) => {
		const superAdminCount = await tx.user.count({
			where: { isSuperAdmin: true },
		});

		return prismaClient.microsoftLogin.upsert({
			where: { id },
			update: {},
			create: {
				id,
				user: {
					connectOrCreate: {
						where: {
							email,
						},
						create: { email, name, isSuperAdmin: superAdminCount === 0 },
					},
				},
			},
		});
	});

const getValidLoginCodeDateThreshold = () => {
	const threshold = new Date();
	threshold.setSeconds(
		threshold.getSeconds() - env.AUTH_TOKEN_RETRIEVAL_TIMEOUT_SECONDS,
	);
	return threshold;
};

export const createLoginCode = (userId: number) => {
	return prismaClient.$transaction(async (tx) => {
		// Delete for current user or old
		await tx.loginCode.deleteMany({
			where: {
				OR: [
					{ userId: userId },
					{ createdAt: { lt: getValidLoginCodeDateThreshold() } },
				],
			},
		});
		return tx.loginCode.create({
			data: { createdAt: new Date(), userId: userId },
		});
	});
};

/** One time operation */
export const retrieveLoginCode = (code: string) =>
	prismaClient.$transaction(async (tx) => {
		const loginCode = await tx.loginCode.findUnique({ where: { code } });
		if (!loginCode) return err("codeNotFound");

		if (loginCode.createdAt < getValidLoginCodeDateThreshold())
			return err("codeNotFound");

		await tx.loginCode.deleteMany({ where: { code } });
		return ok(loginCode);
	});

export const makeUserSuperAdmin = (email: string, currentUser: User) => {
	if (!currentUser.isSuperAdmin) return err("currentUserIsNotSuperAdmin");

	return prismaClient.$transaction(async (tx) => {
		const user = await tx.user.findUnique({ where: { email } });
		if (!user) return err("userDoesNotExist");

		const updatedUser = await tx.user.update({
			where: { id: user.id },
			data: { isSuperAdmin: true },
		});
		return ok(updatedUser);
	});
};

export const demoteUserFromSuperAdmin = async (
	userId: number,
	currentUser: User,
) => {
	if (!currentUser.isSuperAdmin) return err("currentUserIsNotSuperAdmin");

	return prismaClient.$transaction(async (tx) => {
		const superAdminCount = await tx.user.count({
			where: { isSuperAdmin: true },
		});
		if (superAdminCount === 1) return err("cannotRemoveLastSuperAdmin");

		const updatedUser = await tx.user.update({
			where: { id: userId },
			data: { isSuperAdmin: false },
		});
		return ok(updatedUser);
	});
};

export const listSuperAdmins = async (currentUser: User) => {
	if (!currentUser.isSuperAdmin) return err("currentUserIsNotSuperAdmin");

	const superAdmins = prismaClient.user.findMany({
		where: { isSuperAdmin: true },
	});
	return ok(superAdmins);
};
