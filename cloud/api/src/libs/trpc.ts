import { initTRPC } from "@trpc/server";

export type TrpcContext = {
	token?: string;
};

export const { router, procedure } = initTRPC.context<TrpcContext>().create();
