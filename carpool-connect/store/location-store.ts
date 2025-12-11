import { create } from "zustand";

interface CoOrds {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

interface LocationState {
  id: string | null;
  name: string | null;
  phone: string | null;
  pickupInfo: CoOrds | null;
  destInfo: CoOrds | null;

  encodedPolyline: string | null;

  vehicle: string | null;
  seats: number | null;

  date: Date | null;
  time: string | null;

  pricingModel: "per_km" | "fixed" | null;
  price: number | null; // per km model

  setState: (partial: Partial<LocationState>) => void;

  clearAll: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  id: null,
  name: null,
  phone: null,
  pickupInfo: null,
  destInfo: null,
  encodedPolyline: null,

  vehicle: null,
  seats: null,

  date: null,
  time: null,

  pricingModel: null,
  price: null,

  setState: (partial) => set(partial),

  clearAll: () =>
    set({
      id: null,
      pickupInfo: null,
      name: null,
      phone: null,
      destInfo: null,
      encodedPolyline: null,
      vehicle: null,
      seats: null,
      date: null,
      time: null,
      pricingModel: null,
      price: null,
    }),
}));
