import { initTRPC } from "@trpc/server";
import { logger } from "./pino";

export type TrpcContext = {
	token?: string;
};

export const { router, procedure } = initTRPC.context<TrpcContext>().create({
	errorFormatter: ({ error, shape, path }) => {
		logger.error({ error, path }, "Error occured");
		return shape;
	},
});
