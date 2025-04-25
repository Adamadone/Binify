import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

export const organizationBinsRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/organization-bins",
	component: lazyRouteComponent(
		() => import("./OrganizationBinsPage"),
		"OrganizationBinsPage",
	),
});
