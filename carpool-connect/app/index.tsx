// app/index.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import AnimatedSplash from "../components/AnimatedSplash";

// --- ⚠️ REPLACE THIS HOOK WITH YOUR REAL AUTH CHECK ⚠️ ---
// This is a placeholder for checking if the user has a valid stored token/session
const useAuthStatus = () => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // --- Simulate a delay for checking the token/state ---
    const checkToken = setTimeout(() => {
      // !!! REPLACE THIS LINE with your logic to check if the user is authenticated !!!
      // e.g., const token = await AsyncStorage.getItem('userToken');
      const tokenFound = false; // <<< CHANGE THIS to TRUE if the user is logged in

      setIsLoggedIn(tokenFound);
      setIsLoadingAuth(false);
    }, 1000); // Wait 1 second to simulate fetching auth state

    return () => clearTimeout(checkToken);
  }, []);

  return { isLoadingAuth, isLoggedIn };
};
// -----------------------------------------------------------

export default function StartupPage() {
  const { isLoadingAuth, isLoggedIn } = useAuthStatus();

  // Flag to track when the car animation is fully complete
  const [animationDone, setAnimationDone] = useState(false);

  // This useEffect handles the final navigation only when both conditions are met
  useEffect(() => {
    if (!isLoadingAuth && animationDone) {
      if (isLoggedIn) {
        // User is authenticated: Navigate to the main search tab
        router.replace("/(tabs)/search");
      } else {
        // User is NOT authenticated: Navigate to the first sign-in step
        router.replace("/(auth)/signup/emailPage");
      }
    }
  }, [isLoadingAuth, isLoggedIn, animationDone]);

  // While checking auth status OR while the animation is running, show the splash component.
  if (isLoadingAuth || !animationDone) {
    return (
      <AnimatedSplash onAnimationComplete={() => setAnimationDone(true)} />
    );
  }

  // Should not be reached, but necessary for component return type
  return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
}
