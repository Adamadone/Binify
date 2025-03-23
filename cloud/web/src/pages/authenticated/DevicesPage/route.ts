import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

export const devicesRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/devices",
	component: lazyRouteComponent(() => import("./DevicesPage"), "DevicesPage"),
});
