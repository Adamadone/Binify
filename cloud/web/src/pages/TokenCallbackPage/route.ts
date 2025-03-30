import { rootRoute } from "@/libs/tanstackRouter";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import z from "zod";

export const tokenRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/auth/callback",
	component: lazyRouteComponent(
		() => import("./TokenCallbackPage"),
		"TokenCallbackPage",
	),
	validateSearch: z.object({
		code: z.string(),
	}).parse,
});
