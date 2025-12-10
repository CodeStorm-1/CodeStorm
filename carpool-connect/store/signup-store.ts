import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SignupState = {
  email: string | null;
  password: string | null;
  name: string | null;
  phone: string | null;
  otp: string | null;

  /** Update any field by name */
  setField: <K extends keyof SignupState>(
    key: K,
    value: SignupState[K]
  ) => void;
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set): SignupState => ({
      email: null,
      password: null,
      name: null,
      phone: null,
      otp: null,

      setField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
