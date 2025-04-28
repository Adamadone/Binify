import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

export const superAdminRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/super-admins",
	component: lazyRouteComponent(
		() => import("./SuperAdminPage"),
		"SuperAdminPage",
	),
});
