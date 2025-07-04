import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { SnackbarProvider } from "notistack";
import { StorageProvider } from "./context/StorageContext";
import { router } from "./libs/tanstackRouter";
import { queryClient } from "./libs/trpc";

export const App = () => (
	<QueryClientProvider client={queryClient}>
		<StorageProvider>
			<SnackbarProvider />
			<RouterProvider router={router} />
		</StorageProvider>
	</QueryClientProvider>
);
