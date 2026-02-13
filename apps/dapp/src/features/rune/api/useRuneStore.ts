import { create } from "zustand";

interface RuneStore {
	rune: string | null;
	setRune: (rune: string) => void;
}

export const useRuneStore = create<RuneStore>((set) => ({
	rune: null,
	setRune: (rune) => set({ rune }),
}));
