// ── emailLoginStore.ts ──────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PhoneLoginState = {
  phone: string | null;
  otp: string | null;

  /** Update any field by name */
  setField: <K extends keyof PhoneLoginState>(
    key: K,
    value: PhoneLoginState[K]
  ) => void;
};

export const usePhoneLoginStore = create<PhoneLoginState>()(
  persist(
    (set): PhoneLoginState => ({
      phone: null,
      otp: null,

      setField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "phone-login-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
