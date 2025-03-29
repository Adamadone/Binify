import { useStorage } from "@/context/StorageContext";
import { isTokenValid } from "@/helpers/isTokenValid";
import { trpc } from "@/libs/trpc";
import { useQuery } from "@tanstack/react-query";

export const useUserMeQuery = () => {
	const storage = useStorage();
	const token = storage.data.token;

	const userMeQuery = useQuery(
		trpc.accounts.me.queryOptions(undefined, {
			enabled: !!token && isTokenValid(token),
		}),
	);

	return { ...userMeQuery, data: token ? userMeQuery.data : undefined };
};
