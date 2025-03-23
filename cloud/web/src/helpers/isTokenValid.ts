import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token: string) => {
	const { exp } = jwtDecode(token);
	if (!exp) return false;

	return Date.now() <= exp * 1_000;
};
