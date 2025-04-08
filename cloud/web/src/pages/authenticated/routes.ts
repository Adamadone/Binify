import { globalBinsRoute } from "./GlobalBinsPage/route";
import { organizationRoute } from "./OrganizationPage/route";
import { authenticatedRoute } from "./route";

export const authenticatedRoutes = authenticatedRoute.addChildren([
	globalBinsRoute,
	organizationRoute,
]);
