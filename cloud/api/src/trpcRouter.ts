import type { inferRouterOutputs } from "@trpc/server";
import { authenticatedProcedure } from "./auth/trpcAuth";
import { router } from "./libs/trpc";
import { binsRouter } from "./router/binsRouter";

export const trpcRouter = router({
	userMe: authenticatedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
	bins: binsRouter,
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcOutputs = inferRouterOutputs<TrpcRouter>;
