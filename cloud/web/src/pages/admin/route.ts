import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { devicesRoute } from "./DevicesPage/route";

export const adminRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin",
	component: lazyRouteComponent(
		() => import("./AdminRouteGuard"),
		"AdminRouteGuard",
	),
});

export const adminRoutes = adminRoute.addChildren([devicesRoute]);
