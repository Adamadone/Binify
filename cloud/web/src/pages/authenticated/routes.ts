import { devicesRoute } from "./DevicesPage/route";
import { globalBinsRoute } from "./GlobalBinsPage/route";
import { authenticatedRoute } from "./route";

export const authenticatedRoutes = authenticatedRoute.addChildren([
	devicesRoute,
	globalBinsRoute,
]);
