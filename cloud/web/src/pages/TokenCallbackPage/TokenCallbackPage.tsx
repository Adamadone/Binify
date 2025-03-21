import { useStorage } from "@/context/StorageContext";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { devicesRoute } from "../admin/DevicesPage/route";
import { tokenRoute } from "./route";

export const TokenCallbackPage = () => {
	const search = useSearch({ from: tokenRoute.id });
	const navigate = useNavigate({ from: tokenRoute.id });

	const storage = useStorage();

	useEffect(() => {
		storage.set("token", search.token);
		navigate({ to: devicesRoute.id });
	}, [search.token, storage.set, navigate]);

	return null;
};
