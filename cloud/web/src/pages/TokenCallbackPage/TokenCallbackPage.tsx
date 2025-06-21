import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
import { homeRoute } from "../HomePage/route";
import { loginRoute } from "../LoginPage/route";
import { tokenRoute } from "./route";

export const TokenCallbackPage = () => {
	const search = useSearch({ from: tokenRoute.id });
	const navigate = useNavigate({ from: tokenRoute.id });

	const storage = useStorage();

	const { mutate: retrieveToken } = useMutation(
		trpc.accounts.retrieveToken.mutationOptions(),
	);

	const { refetch: refetchOrganizations } = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(undefined, {
			enabled: false,
		}),
	);

	useEffect(() => {
		retrieveToken(
			{ code: search.code },
			{
				onSuccess: ({ token }) => {
					storage.set("token", token);

					if (storage.data.activeOrgId !== undefined) {
						navigate({ to: loginRoute.fullPath });
					}

					refetchOrganizations().then((res) => {
						const firstOrgId = res.data?.[0]?.id;
						if (firstOrgId !== undefined)
							storage.set("activeOrgId", firstOrgId);
					});
					navigate({ to: homeRoute.fullPath });
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Login failed, try it again",
					});
					navigate({ to: loginRoute.fullPath });
				},
			},
		);
	}, [
		search.code,
		storage.set,
		navigate,
		retrieveToken,
		refetchOrganizations,
		storage.data.activeOrgId,
	]);

	return null;
};
