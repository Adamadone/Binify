import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prismaClient } from "./libs/prisma";

const { router, procedure } = initTRPC.create();

export const appRouter = router({
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
