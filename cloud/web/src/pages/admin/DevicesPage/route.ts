import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminRoute } from "../route";

export const devicesRoute = createRoute({
	getParentRoute: () => adminRoute,
	path: "/devices",
	component: lazyRouteComponent(() => import("./DevicesPage"), "DevicesPage"),
});
