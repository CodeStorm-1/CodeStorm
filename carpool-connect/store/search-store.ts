import { create } from "zustand";

interface CoOrds {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

interface SearchState {
  source: CoOrds | null;
  destination: CoOrds | null;
  date: Date | null;

  setSource: (src: CoOrds | null) => void;
  setDestination: (dest: CoOrds | null) => void;
  setDate: (date: Date | null) => void;

  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  source: null,
  destination: null,
  date: null,

  setSource: (src) => set({ source: src }),

  setDestination: (dest) => set({ destination: dest }),

  setDate: (date) => set({ date }),

  clearSearch: () =>
    set({
      source: null,
      destination: null,
      date: null,
    }),
}));
