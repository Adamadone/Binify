import type { inferRouterOutputs } from "@trpc/server";
import { authenticatedProcedure } from "./auth/trpcAuth";
import { router } from "./libs/trpc";
import { binsRouter } from "./router/binsRouter";
import { organizationsRouter } from "./router/organizationsRouter";

export const trpcRouter = router({
	userMe: authenticatedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
	bins: binsRouter,
	organizations: organizationsRouter,
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcOutputs = inferRouterOutputs<TrpcRouter>;
