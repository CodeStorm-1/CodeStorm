// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, Dimensions, Animated } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// const { width, height } = Dimensions.get("window");

// const generateStars = (count = 70) =>
//   Array.from({ length: count }).map(() => ({
//     left: Math.random() * width,
//     top: Math.random() * height,
//     size: Math.random() * 1.8 + 1,
//   }));

// const generateShootingStar = () => ({
//   left: Math.random() * width,
//   top: Math.random() * height * 0.5,
// });

// export default function StarryNight({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const stars = generateStars();
//   const [shootingStar, setShootingStar] = useState(generateShootingStar());
//   const shootingAnim = new Animated.Value(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => {
//         shootingAnim.setValue(0);
//         setShootingStar(generateShootingStar());
//         Animated.timing(shootingAnim, {
//           toValue: 1,
//           duration: 1200,
//           useNativeDriver: true,
//         }).start();
//       },
//       5000 + Math.random() * 4000
//     );

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Main gradient sky */}
//       <LinearGradient
//         colors={["#050414", "#090726", "#100A40", "#0A062E"]}
//         style={StyleSheet.absoluteFill}
//       />

//       {/* Nebula soft glow */}
//       <View
//         style={{
//           backgroundColor: "#6b3cff40",
//           width: 400,
//           height: 400,
//           borderRadius: 200,
//           position: "absolute",
//           top: height * 0.25,
//           left: -120,
//           filter: "blur(50px)",
//         }}
//       />

//       {/* Stars */}
//       {stars.map((star, index) => {
//         const opacity = new Animated.Value(Math.random());
//         Animated.loop(
//           Animated.sequence([
//             Animated.timing(opacity, {
//               toValue: 1,
//               duration: 1500,
//               useNativeDriver: true,
//             }),
//             Animated.timing(opacity, {
//               toValue: 0.3,
//               duration: 1500,
//               useNativeDriver: true,
//             }),
//           ])
//         ).start();

//         return (
//           <Animated.View
//             key={index}
//             style={{
//               position: "absolute",
//               width: star.size,
//               height: star.size,
//               borderRadius: star.size / 2,
//               backgroundColor: "white",
//               left: star.left,
//               top: star.top,
//               opacity: opacity,
//             }}
//           />
//         );
//       })}

//       {/* Shooting star */}
//       <Animated.View
//         style={{
//           position: "absolute",
//           width: 120,
//           height: 2,
//           borderRadius: 2,
//           backgroundColor: "#ffffff",
//           shadowColor: "#ffffff",
//           shadowOpacity: 1,
//           shadowRadius: 8,
//           left: shootingStar.left,
//           top: shootingStar.top,
//           transform: [
//             {
//               translateX: shootingAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [0, 350],
//               }),
//             },
//             {
//               translateY: shootingAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [0, 120],
//               }),
//             },
//           ],
//           opacity: shootingAnim,
//         }}
//       />

//       {/* Children */}
//       <View style={{ flex: 1, padding: 20 }}>{children}</View>
//     </View>
//   );
// }

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// More stars, more variance
const generateStars = (count = 90) =>
  Array.from({ length: count }).map(() => ({
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 2.2 + 0.7,
    glow: Math.random() > 0.7, // some stars glow softly
  }));

const generateShootingStar = () => ({
  left: Math.random() * width * 0.7,
  top: Math.random() * height * 0.4,
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
    const runShootingStar = () => {
      shootingAnim.setValue(0);
      setShootingStar(generateShootingStar());
      Animated.timing(shootingAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }).start();
    };

    const randomDelay = () => 4000 + Math.random() * 5000;
    const interval = setInterval(runShootingStar, randomDelay());
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Deep cosmic gradient */}
      <LinearGradient
        colors={["#02010D", "#04021A", "#060326", "#080638"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Moving Soft Nebula Glow */}
      <Animated.View
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          backgroundColor: "#7F5BFF22",
          borderRadius: 300,
          top: height * 0.2,
          left: -150,
          opacity: 0.6,
        }}
      />

      {/* STARS */}
      {stars.map((star, index) => {
        const opacity = new Animated.Value(Math.random() * 0.8 + 0.3);
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 2000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 1800 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        return (
          <View key={index}>
            {/* soft glow behind some stars */}
            {star.glow && (
              <Animated.View
                style={{
                  position: "absolute",
                  width: star.size * 6,
                  height: star.size * 6,
                  backgroundColor: "#ffffff20",
                  borderRadius: 20,
                  left: star.left - star.size * 2.5,
                  top: star.top - star.size * 2.5,
                }}
              />
            )}

            {/* main star */}
            <Animated.View
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
          </View>
        );
      })}

      {/* SHOOTING STAR */}
      <Animated.View
        style={{
          position: "absolute",
          width: 160,
          height: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          left: shootingStar.left,
          top: shootingStar.top,
          opacity: shootingAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateX: shootingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 450],
              }),
            },
            {
              translateY: shootingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 160],
              }),
            },
            { rotateZ: "-18deg" },
          ],
          shadowColor: "#fff",
          shadowOpacity: 1,
          shadowRadius: 12,
        }}
      />

      {/* Children */}
      <View style={{ flex: 1, padding: 20 }}>{children}</View>
    </View>
  );
}
