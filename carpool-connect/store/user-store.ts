// ── emailLoginStore.ts ──────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserState = {
  email: string | null;
  phone: string | null;
  name: string | null;

  /** Update any field by name */
  setField: <K extends keyof UserState>(key: K, value: UserState[K]) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set): UserState => ({
      email: null,
      phone: null,
      name: null,

      setField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
