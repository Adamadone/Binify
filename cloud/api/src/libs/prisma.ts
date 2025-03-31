import { PrismaClient } from "@prisma/client";
import { env } from "../env";
import { logger } from "./pino";

export const prismaClient = new PrismaClient({
	datasourceUrl: env.DATABASE_URL,
	log: [{ level: "query", emit: "event" }],
});

prismaClient.$on("query", (e) => {
	logger.debug(
		{ query: e.query.replace(/\s+/g, " "), duration: e.duration },
		"Query",
	);
});
