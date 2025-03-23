import { homeRoute } from "@/pages/HomePage/route";
import { loginRoute } from "@/pages/LoginPage/route";
import { tokenRoute } from "@/pages/TokenCallbackPage/route";
import { authenticatedRoutes } from "@/pages/authenticated/routes";
import { createRootRoute, createRouter } from "@tanstack/react-router";

export const rootRoute = createRootRoute();

const routeTree = rootRoute.addChildren([
	homeRoute,
	loginRoute,
	tokenRoute,
	authenticatedRoutes,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
