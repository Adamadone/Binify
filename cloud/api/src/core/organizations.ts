import type { Role, User } from "@prisma/client";
import { err, ok } from "neverthrow";
import { prismaClient } from "../libs/prisma";

export const createOrganization = (name: string, currentUser: User) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.create({ data: { name } });
		const member = await tx.member.create({
			data: {
				organizationId: organization.id,
				userId: currentUser.id,
				role: "ADMIN",
			},
		});
		return { organization, member };
	});

export type UpdateOrganizationParams = {
	id: number;
	name: string;
	alertThresholdPercent?: number;
};
export const updateOrganization = (
	{ id, name, alertThresholdPercent }: UpdateOrganizationParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const updatedOrganization = await tx.organization.update({
			where: { id },
			data: { name, alertThresholdPercent },
		});
		return ok(updatedOrganization);
	});

export const deleteOrganization = (organizationId: number, currentUser: User) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		await tx.organization.delete({ where: { id: organizationId } });
		return ok();
	});

export type AddMemberToOrganizationParams = {
	email: string;
	organizationId: number;
	role: Role;
};

export const addMemberToOrganization = (
	{ email, organizationId, role }: AddMemberToOrganizationParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const user = await tx.user.findUnique({
			where: { email },
		});
		if (!user) return err("userDoesNotExist");

		const existingMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId,
					userId: user.id,
				},
			},
		});
		if (existingMember) return err("userIsAlreadyMember");

		const newMember = await tx.member.create({
			data: {
				organizationId,
				userId: user.id,
				role,
			},
			include: {
				user: true,
			},
		});

		return ok(newMember);
	});

export type ChangeMemberRoleParams = {
	userId: number;
	organizationId: number;
	role: Role;
};
export const changeMemberRole = (
	{ userId, organizationId, role }: ChangeMemberRoleParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});
		if (!currentMember || currentMember.role !== "ADMIN")
			return err("currentUserIsNotAdmin");

		const member = await tx.member.findUnique({
			where: { userId_organizationId: { organizationId, userId } },
		});
		if (!member) return err("userIsNotMember");

		const updatedMember = await tx.member.update({
			where: { userId_organizationId: { userId, organizationId } },
			data: { role },
		});
		return ok(updatedMember);
	});

export type RemoveMemberFromOrganizationParams = {
	userId: number;
	organizationId: number;
};
export const removeMemberFromOrganization = (
	{ userId, organizationId }: RemoveMemberFromOrganizationParams,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});
		const isAdmin = currentMember && currentMember.role === "ADMIN";
		const isSameUser = userId === currentUser.id;
		if (!isAdmin && !isSameUser)
			return err("currentUserIsNotAdminAndIsNotSameUser");

		const member = await tx.member.findUnique({
			where: { userId_organizationId: { organizationId, userId } },
		});
		if (!member) return err("userIsNotMember");

		const numberOfAdmins = await tx.member.count({
			where: {
				organizationId,
				role: "ADMIN",
			},
		});
		if (member.role === "ADMIN" && numberOfAdmins === 1)
			return err("cannotRemoveLastAdmin");

		await tx.member.delete({
			where: { userId_organizationId: { userId, organizationId } },
		});
		return ok();
	});

export const listOrganizationsForCurrentUser = async (currentUser: User) => {
	const rawOrganizations = await prismaClient.organization.findMany({
		where: { members: { some: { userId: currentUser.id } } },
		include: {
			members: {
				where: {
					userId: currentUser.id,
				},
			},
		},
	});
	if (!rawOrganizations) return rawOrganizations;
	return rawOrganizations.map((organization) => ({
		...organization,
		member: organization.members[0],
		members: undefined,
	}));
};

export const getOrganizationById = (
	organizationId: number,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});

		if (!currentMember) return err("userIsNotOrganizationMember");
		return ok(organization);
	});

export const listOrganizationMembers = (
	organizationId: number,
	currentUser: User,
) =>
	prismaClient.$transaction(async (tx) => {
		const organization = await tx.organization.findUnique({
			where: { id: organizationId },
		});
		if (!organization) return err("organizationDoesNotExist");

		const currentMember = await tx.member.findUnique({
			where: {
				userId_organizationId: {
					organizationId: organization.id,
					userId: currentUser.id,
				},
			},
		});

		if (!currentMember) return err("userIsNotOrganizationMember");

		const members = await tx.member.findMany({
			where: { organizationId: organization.id },
			include: {
				user: true,
			},
		});

		return ok(members);
	});
