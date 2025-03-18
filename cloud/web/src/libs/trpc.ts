import type { AppRouter } from "@bin/api";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
	createTRPCContext,
	createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { env } from "../env";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ url: `${env.VITE_API_URL}/trpc` })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
