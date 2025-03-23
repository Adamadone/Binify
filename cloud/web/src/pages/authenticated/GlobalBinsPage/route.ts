import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

export const globalBinsRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/global-bins",
	component: lazyRouteComponent(
		() => import("./GlobalBinsPage"),
		"GlobalBinsPage",
	),
});
