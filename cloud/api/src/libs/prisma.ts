import { PrismaClient } from "@prisma/client";
import { env } from "../env";

export const prismaClient = new PrismaClient({
	datasourceUrl: env.DATABASE_URL,
});
