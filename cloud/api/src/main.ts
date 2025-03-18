import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { env } from "./env";
import { appRouter } from "./router";

const createContext = (_opts: trpcExpress.CreateExpressContextOptions) => ({});

const app = express();

app.use(cors({ origin: "*" }));
app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

app.listen(env.PORT);
console.log(`App listening on http://localhost:${env.PORT}`);
