// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   Dimensions,
//   Animated,
//   Easing,
//   Platform,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// const { width, height } = Dimensions.get("window");

// /* --------------------------------------------------------------
//    Helpers – generate the static star field and the shooting‑star
//    -------------------------------------------------------------- */
// const generateStars = (count = 70) =>
//   Array.from({ length: count }).map(() => ({
//     left: Math.random() * width,
//     top: Math.random() * height,
//     size: Math.random() * 1.2 + 0.8, // a bit smaller than before
//   }));

// const generateShootingStar = () => ({
//   left: Math.random() * width,
//   top: Math.random() * height * 0.4, // keep it in the upper half
// });

// /* --------------------------------------------------------------
//    StarryNight component
//    -------------------------------------------------------------- */
// export default function StarryNight({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   /* ---- Static stars – memoised so we only create them once ---- */
//   const stars = useMemo(() => generateStars(70), []);

//   /* ---- Shooting star state & animation ----------------------- */
//   const [shootingStar, setShootingStar] = useState(generateShootingStar());
//   const shootingAnim = useRef(new Animated.Value(0)).current;

//   /* ---- Shared twinkle animation for *all* stars -------------- */
//   const twinkleAnim = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(twinkleAnim, {
//           toValue: 1,
//           duration: 1800,
//           easing: Easing.inOut(Easing.quad),
//           useNativeDriver: true,
//         }),
//         Animated.timing(twinkleAnim, {
//           toValue: 0,
//           duration: 1800,
//           easing: Easing.inOut(Easing.quad),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [twinkleAnim]);

//   /* ---- Shooting‑star interval -------------------------------- */
//   useEffect(() => {
//     const interval = setInterval(
//       () => {
//         shootingAnim.setValue(0);
//         setShootingStar(generateShootingStar());

//         Animated.timing(shootingAnim, {
//           toValue: 1,
//           duration: 1200,
//           easing: Easing.out(Easing.quad),
//           useNativeDriver: true,
//         }).start();
//       },
//       5000 + Math.random() * 4000
//     );

//     return () => clearInterval(interval);
//   }, [shootingAnim]);

//   /* --------------------------------------------------------------
//      Render
//      -------------------------------------------------------------- */
//   return (
//     <View style={styles.container}>
//       {/* 1️⃣  Dark night sky gradient */}
//       <LinearGradient
//         colors={["#03010A", "#0A0435", "#0D0750", "#06031C"]}
//         style={StyleSheet.absoluteFill}
//       />

//       {/* 2️⃣  Very dim nebula – blurred for a soft glow */}
//       <View
//         style={[
//           styles.nebula,
//           {
//             top: height * 0.28,
//             left: -120,
//           },
//         ]}
//       />

//       {/* 3️⃣  Stars – each gets its own position/size but shares the twinkle animation */}
//       {stars.map((star, i) => {
//         // Opacity varies between 0.15 and 0.5, driven by the shared animation.
//         const opacity = twinkleAnim.interpolate({
//           inputRange: [0, 0.5, 1],
//           outputRange: [
//             Math.random() * 0.15 + 0.15,
//             Math.random() * 0.35 + 0.35,
//             Math.random() * 0.15 + 0.15,
//           ],
//         });

//         return (
//           <Animated.View
//             key={i}
//             style={[
//               styles.star,
//               {
//                 left: star.left,
//                 top: star.top,
//                 width: star.size,
//                 height: star.size,
//                 borderRadius: star.size / 2,
//                 opacity,
//               },
//             ]}
//           />
//         );
//       })}

//       {/* 4️⃣  Shooting star – short white streak with a fading tail */}
//       <Animated.View
//         style={[
//           styles.shootingStar,
//           {
//             left: shootingStar.left,
//             top: shootingStar.top,
//             opacity: shootingAnim.interpolate({
//               inputRange: [0, 0.3, 1],
//               outputRange: [0, 0.3, 0],
//             }),
//             transform: [
//               {
//                 translateX: shootingAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, 350],
//                 }),
//               },
//               {
//                 translateY: shootingAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, 120],
//                 }),
//               },
//             ],
//           },
//         ]}
//       >
//         {/* Tail – a linear gradient that fades out */}
//         <LinearGradient
//           colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0)"]}
//           start={{ x: 0, y: 0.5 }}
//           end={{ x: 1, y: 0.5 }}
//           style={StyleSheet.absoluteFill}
//         />
//       </Animated.View>

//       {/* 5️⃣  Content passed by the user */}
//       <View style={styles.childrenContainer}>{children}</View>
//     </View>
//   );
// }

// /* --------------------------------------------------------------
//    Styles – kept separate for readability
//    -------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000", // fallback for devices that don’t render the gradient instantly
//   },

//   nebula: {
//     position: "absolute",
//     width: 420,
//     height: 420,
//     borderRadius: 210,
//     backgroundColor: "#2a004f80", // deep violet with low opacity
//     // `blurRadius` works on iOS and Android (>= 21). For web we keep the original CSS filter.
//     ...Platform.select({
//       ios: { shadowColor: "#2a004f", shadowOpacity: 1, shadowRadius: 100 },
//       android: { elevation: 30 },
//     }),
//   },

//   star: {
//     position: "absolute",
//     backgroundColor: "#ffffff",
//   },

//   shootingStar: {
//     position: "absolute",
//     width: 140,
//     height: 2,
//     borderRadius: 2,
//     backgroundColor: "rgba(255,255,255,0.6)",
//     // Slight glow
//     shadowColor: "#fff",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 6,
//   },

//   childrenContainer: {
//     flex: 1,
//     padding: 20,
//   },
// });

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

/* --------------------------------------------------------------
   Helpers – generate the static star field and the shooting‑star
   -------------------------------------------------------------- */
const generateStars = (count = 70) =>
  Array.from({ length: count }).map(() => ({
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 1.2 + 0.8, // a bit smaller than before
  }));

const generateShootingStar = () => ({
  left: Math.random() * width,
  top: Math.random() * height * 0.4, // keep it in the upper half
});

/* --------------------------------------------------------------
   StarryNight component
   -------------------------------------------------------------- */
export default function StarryNight({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ---- Static stars – memoised so we only create them once ---- */
  const stars = useMemo(() => generateStars(70), []);

  /* ---- Shooting star state & animation ----------------------- */
  const [shootingStar, setShootingStar] = useState(generateShootingStar());
  const shootingAnim = useRef(new Animated.Value(0)).current;

  /* ---- Shared twinkle animation for *all* stars -------------- */
  const twinkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [twinkleAnim]);

  /* ---- Shooting‑star interval -------------------------------- */
  useEffect(() => {
    const interval = setInterval(
      () => {
        shootingAnim.setValue(0);
        setShootingStar(generateShootingStar());

        Animated.timing(shootingAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      },
      5000 + Math.random() * 4000
    );

    return () => clearInterval(interval);
  }, [shootingAnim]);

  /* --------------------------------------------------------------
     Render
     -------------------------------------------------------------- */
  return (
    <View style={styles.container}>
      {/* 1️⃣  Dark‑blue night sky gradient */}
      <LinearGradient
        colors={["#02020F", "#0A0C35", "#111754", "#06031C"]} // <-- dark‑blue palette
        style={StyleSheet.absoluteFill}
      />

      {/* 2️⃣  Very dim blue nebula – blurred for a soft glow */}
      <View
        style={[
          styles.nebula,
          {
            top: height * 0.28,
            left: -120,
          },
        ]}
      />

      {/* 3️⃣  Stars – each gets its own position/size but shares the twinkle animation */}
      {stars.map((star, i) => {
        const opacity = twinkleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [
            Math.random() * 0.15 + 0.15,
            Math.random() * 0.35 + 0.35,
            Math.random() * 0.15 + 0.15,
          ],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity,
              },
            ]}
          />
        );
      })}

      {/* 4️⃣  Shooting star – short white streak with a fading tail */}
      <Animated.View
        style={[
          styles.shootingStar,
          {
            left: shootingStar.left,
            top: shootingStar.top,
            opacity: shootingAnim.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 0.3, 0],
            }),
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
          },
        ]}
      >
        {/* Tail – linear gradient that fades out */}
        <LinearGradient
          colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 5️⃣  Content passed by the user */}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
}

/* --------------------------------------------------------------
   Styles – unchanged except for colour tweaks
   -------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // fallback while gradient loads
  },

  nebula: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "#00124d80", // deep midnight‑blue with low opacity
    // `blurRadius` works on iOS/Android. For web we use a shadow trick.
    ...Platform.select({
      ios: { shadowColor: "#00124d", shadowOpacity: 1, shadowRadius: 100 },
      android: { elevation: 30 },
    }),
  },

  star: {
    position: "absolute",
    backgroundColor: "#ffffff", // keep white for maximum contrast
  },

  shootingStar: {
    position: "absolute",
    width: 140,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  childrenContainer: {
    flex: 1,
    padding: 20,
  },
});
