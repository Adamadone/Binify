import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";

export const DevicesPage = () => {
	const userMeQuery = useQuery(trpc.userMe.queryOptions());

	const renderContent: RenderContent<TrpcOutputs["userMe"]> = (user) => {
		return user.email;
	};

	return <DynamicContent {...userMeQuery} renderContent={renderContent} />;
};
