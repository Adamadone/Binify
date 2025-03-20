import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { authRouter, setupAuth } from "./auth/expressAuth";
import { env } from "./env";
import { logger } from "./libs/pino";
import { trpcRouter } from "./trpcRouter";

const createContext = async (
	opts: trpcExpress.CreateExpressContextOptions,
) => ({
	token: opts.req.headers.authorization,
});

setupAuth();
const app = express();

app.use(cors({ origin: "*" }));
app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({ router: trpcRouter, createContext }),
);
app.use(authRouter);

app.listen(env.PORT);
logger.info(`App listening on http://localhost:${env.PORT}`);
