import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from "react-native-toast-message";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { JSX } from "react";

export const useToastConfig = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    success: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <BaseToast
        {...props}
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: "#22C55E",
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          color: isDark ? "white" : "black",
          fontSize: 16,
          fontWeight: "600",
        }}
        text2Style={{
          color: isDark ? "#D1D5DB" : "#6B7280",
        }}
      />
    ),

    error: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: "#EF4444",
        }}
        text1Style={{
          color: isDark ? "white" : "black",
        }}
        text2Style={{
          color: isDark ? "#D1D5DB" : "#6B7280",
        }}
      />
    ),
  };
};
