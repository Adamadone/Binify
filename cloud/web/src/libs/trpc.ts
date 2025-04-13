import { loadStorage } from "@/context/StorageContext";
import type { TrpcRouter } from "@bin/api";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
	createTRPCContext,
	createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { env } from "../env";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<TrpcRouter>();

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<TrpcRouter>({
	links: [
		httpBatchLink({
			url: `${env.VITE_API_URL}/trpc`,
			headers: () => {
				// TODO: this is inefficient, should load just token
				return { authorization: `Bearer ${loadStorage().token}` };
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<TrpcRouter>({
	client: trpcClient,
	queryClient,
});
