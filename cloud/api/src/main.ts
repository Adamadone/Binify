import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { prismaClient } from "./libs/prisma";

const { router, procedure } = initTRPC.create();

const createContext = (_opts: trpcExpress.CreateExpressContextOptions) => ({});

const appRouter = router({
	createBin: procedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input }) => {
			const bin = prismaClient.bin.create({ data: { name: input.name } });
			return bin;
		}),
	listBins: procedure.query(async () => {
		return prismaClient.bin.findMany();
	}),
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(cors({ origin: "*" }));
app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

// TODO: make it configurable
app.listen(4000);
console.log("App listening on http://localhost:4000");
