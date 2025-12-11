import { create } from "zustand";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface DriverRouteState {
  userId: string | null;
  points: LatLng[];

  setUserId: (id: string) => void;
  setPoints: (pts: LatLng[]) => void;

  clear: () => void;
}

export const useDriverRouteStore = create<DriverRouteState>((set) => ({
  userId: null,
  points: [],

  setUserId: (id) => set({ userId: id }),

  setPoints: (pts) => set({ points: pts }),

  clear: () =>
    set({
      userId: null,
      points: [],
    }),
}));
