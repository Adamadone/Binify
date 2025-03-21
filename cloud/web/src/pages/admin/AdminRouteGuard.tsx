import { useStorage } from "@/context/StorageContext";
import { Navigate, Outlet } from "@tanstack/react-router";
import { loginRoute } from "../LoginPage/route";

export const AdminRouteGuard = () => {
	const storage = useStorage();

	// TODO: check token validity
	if (!storage.data.token) return <Navigate to={loginRoute.id} />;
	return <Outlet />;
};
