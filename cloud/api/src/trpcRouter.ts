import type { inferRouterOutputs } from "@trpc/server";
import { router } from "./libs/trpc";
import { accountsRouter } from "./router/accountsRouter";
import { alertsRouter } from "./router/alertsRouter";
import { binsRouter } from "./router/binsRouter";
import { organizationsRouter } from "./router/organizationsRouter";

export const trpcRouter = router({
	accounts: accountsRouter,
	organizations: organizationsRouter,
	bins: binsRouter,
	alerts: alertsRouter,
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcOutputs = inferRouterOutputs<TrpcRouter>;
