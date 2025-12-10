import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToastConfig } from "@/components/toastconfig";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const toastConfig = useToastConfig();
  const colorScheme = useColorScheme();

  const token = useAuthStore((s) => s.token);

  const segments = useSegments();

  // ---------- AUTH GUARD ----------
  // Runs whenever route or token changes
  useEffect(() => {
    const inAuth = segments[0] === "(auth)";
    const inTabs = segments[0] === "(tabs)";

    if (!token && inTabs) {
      router.replace("/(auth)/signup/emailPage");
    }

    if (token && inAuth) {
      router.replace("/(tabs)/search");
    }
  }, [segments, token]);
  // ---------------------------------

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationTypeForReplace: "push",
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
