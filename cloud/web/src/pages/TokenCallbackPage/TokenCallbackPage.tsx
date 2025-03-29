import { useStorage } from "@/context/StorageContext";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { homeRoute } from "../HomePage/route";
import { tokenRoute } from "./route";

export const TokenCallbackPage = () => {
	const search = useSearch({ from: tokenRoute.id });
	const navigate = useNavigate({ from: tokenRoute.id });

	const storage = useStorage();

	useEffect(() => {
		storage.set("token", search.token);
		navigate({ to: homeRoute.fullPath });
	}, [search.token, storage.set, navigate]);

	return null;
};
