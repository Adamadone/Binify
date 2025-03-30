import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import { useMutation } from "@tanstack/react-query";
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

	useEffect(() => {
		retrieveToken(
			{ code: search.code },
			{
				onSuccess: ({ token }) => {
					storage.set("token", token);
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
	}, [search.code, storage.set, navigate, retrieveToken]);

	return null;
};
