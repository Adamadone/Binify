import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

export const authenticatedRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "authenticated",
	component: lazyRouteComponent(
		() => import("./AuthenticatedRouteGuard"),
		"AuthenticatedRouteGuard",
	),
});
