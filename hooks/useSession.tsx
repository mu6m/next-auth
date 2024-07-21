import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

interface AuthStore {
	isLoggedIn: boolean;
	login: () => void;
	logout: () => void;
}
const useSession = create(
	persist<AuthStore>(
		(set: any) => ({
			isLoggedIn: false,
			login: async () => {
				const cookie = await cookies().get("user");
				const token = await verifyAccessToken(cookie?.value);
				if (token === false || !token) {
					await cookies().delete("user");
					return set({ isLoggedIn: false });
				}
				return set({ isLoggedIn: true });
			},
			logout: async () => {
				await cookies().delete("user");
				return set({ isLoggedIn: false });
			},
		}),
		{
			name: "userLoginStatus",
		}
	)
);

export default useSession;
