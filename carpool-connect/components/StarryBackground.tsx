// import React from "react";
// import { View, StyleSheet, Dimensions } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// const { width, height } = Dimensions.get("window");

// // Function to generate random star positions
// const generateStars = (count = 80) => {
//   return Array.from({ length: count }).map(() => ({
//     left: Math.random() * width,
//     top: Math.random() * height,
//     size: Math.random() * 2 + 1,
//     opacity: Math.random() * 0.8 + 0.2,
//   }));
// };

// const stars = generateStars();

// export default function StarryBackground({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <View style={{ flex: 1 }}>
//       {/* Night sky gradient */}
//       <LinearGradient
//         colors={["#02010A", "#06021C", "#0A052E", "#0C063F"]}
//         style={StyleSheet.absoluteFill}
//       />

//       {/* Stars */}
//       {stars.map((star, index) => (
//         <View
//           key={index}
//           style={{
//             position: "absolute",
//             width: star.size,
//             height: star.size,
//             borderRadius: star.size / 2,
//             backgroundColor: "white",
//             left: star.left,
//             top: star.top,
//             opacity: star.opacity,
//           }}
//         />
//       ))}

//       {/* Content */}
//       <View style={{ flex: 1, padding: 20 }}>{children}</View>
//     </View>
//   );
// }

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const generateStars = (count = 70) =>
  Array.from({ length: count }).map(() => ({
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 1.8 + 1,
  }));

const generateShootingStar = () => ({
  left: Math.random() * width,
  top: Math.random() * height * 0.5,
});

export default function StarryNight({
  children,
}: {
  children: React.ReactNode;
}) {
  const stars = generateStars();
  const [shootingStar, setShootingStar] = useState(generateShootingStar());
  const shootingAnim = new Animated.Value(0);

  useEffect(() => {
    const interval = setInterval(
      () => {
        shootingAnim.setValue(0);
        setShootingStar(generateShootingStar());
        Animated.timing(shootingAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start();
      },
      5000 + Math.random() * 4000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Main gradient sky */}
      <LinearGradient
        colors={["#050414", "#090726", "#100A40", "#0A062E"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Nebula soft glow */}
      <View
        style={{
          backgroundColor: "#6b3cff40",
          width: 400,
          height: 400,
          borderRadius: 200,
          position: "absolute",
          top: height * 0.25,
          left: -120,
          filter: "blur(50px)",
        }}
      />

      {/* Stars */}
      {stars.map((star, index) => {
        const opacity = new Animated.Value(Math.random());
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();

        return (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: "white",
              left: star.left,
              top: star.top,
              opacity: opacity,
            }}
          />
        );
      })}

      {/* Shooting star */}
      <Animated.View
        style={{
          position: "absolute",
          width: 120,
          height: 2,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          shadowColor: "#ffffff",
          shadowOpacity: 1,
          shadowRadius: 8,
          left: shootingStar.left,
          top: shootingStar.top,
          transform: [
            {
              translateX: shootingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 350],
              }),
            },
            {
              translateY: shootingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 120],
              }),
            },
          ],
          opacity: shootingAnim,
        }}
      />

      {/* Children */}
      <View style={{ flex: 1, padding: 20 }}>{children}</View>
    </View>
  );
}
