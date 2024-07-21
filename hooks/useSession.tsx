import { create } from "zustand";

export const useSession = create((set) => ({
	user: null,
	setUser: (user: any) => set({ user }),
	clearUser: () => set({ user: null }),
}));
