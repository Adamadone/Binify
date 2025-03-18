import { QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "./pages/HomePage";
import { queryClient } from "./trpc";

export const App = () => (
	<QueryClientProvider client={queryClient}>
		<HomePage />
	</QueryClientProvider>
);
