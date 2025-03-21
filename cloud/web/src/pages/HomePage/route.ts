import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

export const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: lazyRouteComponent(() => import("./HomePage"), "HomePage"),
});
