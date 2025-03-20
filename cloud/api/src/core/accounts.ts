import { prismaClient } from "../libs/prisma";

export const findUser = (id: number) =>
	prismaClient.user.findFirst({ where: { id } });

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
	prismaClient.microsoftLogin.upsert({
		where: { id },
		update: {},
		create: {
			id,
			user: {
				connectOrCreate: {
					where: {
						email,
					},
					create: { email, name },
				},
			},
		},
	});
