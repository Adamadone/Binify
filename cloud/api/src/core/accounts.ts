import type { User } from "@prisma/client";
import { err, ok } from "neverthrow";
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

	const updatedUser = await prismaClient.user.update({
		where: { id: userId },
		data: { isSuperAdmin: false },
	});
	return ok(updatedUser);
};

export const listSuperAdmins = async (currentUser: User) => {
	if (!currentUser.isSuperAdmin) return err("currentUserIsNotSuperAdmin");

	const superAdmins = prismaClient.user.findMany({
		where: { isSuperAdmin: true },
	});
	return ok(superAdmins);
};
