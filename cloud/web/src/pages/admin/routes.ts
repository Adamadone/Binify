import { devicesRoute } from "./DevicesPage/route";
import { adminRoute } from "./route";

export const adminRoutes = adminRoute.addChildren([devicesRoute]);
