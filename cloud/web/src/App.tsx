import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/trpc";
import { HomePage } from "./pages/HomePage";

export const App = () => (
	<QueryClientProvider client={queryClient}>
		<HomePage />
	</QueryClientProvider>
);
