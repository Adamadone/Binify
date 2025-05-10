import { alertHistoryRoute } from "./AlertHistoryPage/route";
import { deviceDetailRoute } from "./DeviceDetailPage/route";
import { globalBinsRoute } from "./GlobalBinsPage/route";
import { organizationBinsRoute } from "./OrganizationBinsPage/route";
import { organizationRoute } from "./OrganizationPage/route";
import { superAdminRoute } from "./SuperAdminPage/route";
import { authenticatedRoute } from "./route";

export const authenticatedRoutes = authenticatedRoute.addChildren([
	globalBinsRoute,
	organizationRoute,
	deviceDetailRoute,
	organizationBinsRoute,
	superAdminRoute,
	alertHistoryRoute,
]);
