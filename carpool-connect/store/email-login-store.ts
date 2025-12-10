// ── emailLoginStore.ts ──────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type EmailLoginState = {
  email: string | null;
  password: string | null;

  /** Update any field by name */
  setField: <K extends keyof EmailLoginState>(
    key: K,
    value: EmailLoginState[K]
  ) => void;
};

export const useEmailLoginStore = create<EmailLoginState>()(
  persist(
    (set): EmailLoginState => ({
      email: null,
      password: null,

      setField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "email-login-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
