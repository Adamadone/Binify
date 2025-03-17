import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { type AppRouter } from '@bin/api'
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

export const queryClient = new QueryClient()

const trpcClient = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: "http://localhost:4000/trpc" })] })

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient })

