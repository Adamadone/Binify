import { globalBinsRoute } from "./GlobalBinsPage/route";
import { authenticatedRoute } from "./route";

export const authenticatedRoutes = authenticatedRoute.addChildren([
	globalBinsRoute,
]);
