import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

export const adminRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin",
	component: lazyRouteComponent(
		() => import("./AdminRouteGuard"),
		"AdminRouteGuard",
	),
});
