import { OrganizationPage } from "@/pages/authenticated/OrganizationPage/OrganizationPage";
import { createRoute } from "@tanstack/react-router";
import { authenticatedRoute } from "../route";

// Create a fixed route for the organization page
export const organizationRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/organization",
	component: OrganizationPage,
});
