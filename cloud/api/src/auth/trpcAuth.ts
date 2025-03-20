import { TRPCError } from "@trpc/server";
import { findUser } from "../core/accounts";
import { logger } from "../libs/pino";
import { procedure } from "../libs/trpc";
import { decodeJwt } from "./jwt";

export const authenticatedProcedure = procedure.use(async (opts) => {
	if (!opts.ctx.token) {
		logger.error("Token is missing");
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const tokenWithoutBearer = opts.ctx.token.replace("Bearer ", "");
	const decodedToken = await decodeJwt(tokenWithoutBearer);
	if (!decodedToken) {
		logger.error("Failed to decode token");
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	logger.debug({ userId: decodedToken.userId }, "Token decoded");

	const user = await findUser(decodedToken.userId);
	if (!user) {
		logger.error("User not found");
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	logger.debug({ userId: user.id }, "User found");

	return opts.next({ ctx: { user } });
});
