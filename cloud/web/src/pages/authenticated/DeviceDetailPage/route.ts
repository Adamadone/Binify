import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticatedRoute } from "../route";
import { DeviceDetailPage } from "./DeviceDetailPage";

export const deviceDetailRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/devices/$binId",
	component: DeviceDetailPage,
	validateSearch: z.object({
		binName: z.string().optional(),
	}),
});
