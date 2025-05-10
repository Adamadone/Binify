import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

export const alertHistoryRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/alert-history",
	component: lazyRouteComponent(
		() => import("./AlertHistoryPage"),
		"AlertHistoryPage",
	),
});
