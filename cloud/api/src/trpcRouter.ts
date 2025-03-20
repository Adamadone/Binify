import { z } from "zod";
import { authenticatedProcedure } from "./auth/trpcAuth";
import { prismaClient } from "./libs/prisma";
import { procedure, router } from "./libs/trpc";

export const trpcRouter = router({
	createBin: procedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input }) => {
			const bin = prismaClient.bin.create({ data: { name: input.name } });
			return bin;
		}),
	listBins: procedure.query(async () => {
		return prismaClient.bin.findMany();
	}),
	userMe: authenticatedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
});

export type AppRouter = typeof trpcRouter;
