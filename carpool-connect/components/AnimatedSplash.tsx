// components/AnimatedSplash.tsx
import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme"; // Use theme hook for background

const { width } = Dimensions.get("window");
const ANIMATION_DURATION = 3000; // 3 seconds

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({
  onAnimationComplete,
}: AnimatedSplashProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#000000" : "#ffffff";

  // Start the Animated Value at 0, which corresponds to the car being off-screen left
  const carPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the carPosition value from 0 to the full screen width
    Animated.timing(carPosition, {
      toValue: width,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Animation complete: call the function passed by the parent
      onAnimationComplete();
    });

    return () => carPosition.stopAnimation();
  }, [carPosition, onAnimationComplete]);

  const animatedStyle = {
    // The car moves horizontally based on the carPosition value
    transform: [{ translateX: carPosition }],
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.carWrapper, animatedStyle]}>
        {/* Car icon color matching your app's red color scheme */}
        <Ionicons name="car-sport" size={50} color="#EF4444" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  carWrapper: {
    position: "absolute",
    alignSelf: "flex-start",
    // Start the car 50 units (the size of the icon) off-screen to the left
    left: -50,
    top: "50%",
    marginTop: -25, // Center it vertically
  },
});
