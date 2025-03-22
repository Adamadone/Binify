import { Layout } from "@/components/Layout";
import { homeRoute } from "@/pages/HomePage/route";
import { loginRoute } from "@/pages/LoginPage/route";
import { tokenRoute } from "@/pages/TokenCallbackPage/route";
import { adminRoutes } from "@/pages/admin/routes";
import { createRootRoute, createRouter } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
	component: Layout,
});

const routeTree = rootRoute.addChildren([
	homeRoute,
	loginRoute,
	tokenRoute,
	adminRoutes,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
