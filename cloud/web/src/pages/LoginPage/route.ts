import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/auth/login",
	component: lazyRouteComponent(() => import("./LoginPage"), "LoginPage"),
});
