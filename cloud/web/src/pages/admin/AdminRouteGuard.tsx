import { useStorage } from "@/context/StorageContext";
import { isTokenValid } from "@/helpers/isTokenValid";
import { Navigate, Outlet } from "@tanstack/react-router";
import { loginRoute } from "../LoginPage/route";

export const AdminRouteGuard = () => {
	const storage = useStorage();

	if (!storage.data.token || !isTokenValid(storage.data.token))
		return <Navigate to={loginRoute.id} />;
	return <Outlet />;
};
