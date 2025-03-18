import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient({
	// TODO: make it configurable
	datasourceUrl: "postgresql://postgres:postgres@localhost:5432/bin",
});
