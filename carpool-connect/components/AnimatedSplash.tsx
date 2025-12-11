// ──────────────────────────────────────────────────────────────────────────────
// components/AnimatedSplash.tsx
// (Only the parts that changed are highlighted with comments)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";

let MaskedView: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MaskedView = require("@react-native-masked-view/masked-view").default;
} catch {
  MaskedView = null;
}

/* ──────────────────────────────────────────────────────────────────────────────
   CONSTANTS & CONFIG
   ────────────────────────────────────────────────────────────────────────────── */
const { width: SCREEN_W } = Dimensions.get("window");
const APP_NAME = "Carpool-Connect";
const ACCENT_COLOR = "#EF4444";

const TIMINGS = {
  TOTAL: 3000,
  BUS_TRAVEL: 1800, // ← name kept for backward‑compatibility
  TEXT_REVEAL: 1400,
  HOLD_AFTER_REVEAL: 300,
  FADE_OUT: 300,
};

/* ──────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────────── */
interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({
  onAnimationComplete,
}: AnimatedSplashProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#000" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";

  /* ────── Animated values ────── */
  const busProgress = useRef(new Animated.Value(0)).current; // still called busProgress internally
  const textProgress = useRef(new Animated.Value(0)).current;
  const fadeOpacity = useRef(new Animated.Value(1)).current;

  /* ────── Interpolations ────── */
  const busTranslateX = busProgress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [-80, SCREEN_W * 0.45, SCREEN_W + 80],
  });

  const busScale = busProgress.interpolate({
    inputRange: [0, 0.5, 0.85, 1],
    outputRange: [0.6, 1.1, 1, 0.9],
    extrapolate: "clamp",
  });

  const textMaskWidth = textProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_W],
  });

  const textOpacity = textProgress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
  });

  /* ────── Animation sequence ────── */
  useEffect(() => {
    const busAnim = Animated.timing(busProgress, {
      toValue: 1,
      duration: TIMINGS.BUS_TRAVEL,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const textAnim = Animated.timing(textProgress, {
      toValue: 1,
      duration: TIMINGS.TEXT_REVEAL,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });

    const fadeAnim = Animated.timing(fadeOpacity, {
      toValue: 0,
      duration: TIMINGS.FADE_OUT,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });

    Animated.sequence([
      Animated.parallel([busAnim, textAnim]),
      Animated.delay(TIMINGS.HOLD_AFTER_REVEAL),
      fadeAnim,
    ]).start(() => {
      onAnimationComplete?.();
    });

    return () => {
      busProgress.stopAnimation();
      textProgress.stopAnimation();
      fadeOpacity.stopAnimation();
    };
  }, [busProgress, textProgress, fadeOpacity, onAnimationComplete]);

  /* ────── Render helpers ────── */
  const renderAnimatedText = () => {
    if (MaskedView) {
      return (
        <MaskedView
          style={styles.maskedContainer}
          maskElement={
            <Animated.View
              style={[
                styles.mask,
                { width: textMaskWidth, backgroundColor: "#fff" },
              ]}
            />
          }
        >
          <Text style={[styles.appNameText, { color: textColor }]}>
            {APP_NAME}
          </Text>
        </MaskedView>
      );
    }

    return (
      <Animated.View
        style={[
          styles.textMaskContainer,
          { width: textMaskWidth, opacity: textOpacity },
        ]}
      >
        <Text style={[styles.appNameText, { color: textColor }]}>
          {APP_NAME}
        </Text>
      </Animated.View>
    );
  };

  /* ────── JSX ────── */
  return (
    <Animated.View
      style={[styles.container, { backgroundColor, opacity: fadeOpacity }]}
    >
      <View style={styles.track}>
        {renderAnimatedText()}

        {/* ----------  CAR ICON REPLACE ---------- */}
        <Animated.View
          style={[
            styles.busWrapper,
            {
              transform: [{ translateX: busTranslateX }, { scale: busScale }],
            },
          ]}
        >
          {/* 1️⃣ Choose any Ionicons car you like.
              • "car"            – classic sedan
              • "car-sport"      – sport‑style
              • "car-outline"   – outline version
              • "car-sharp"     – sharp style
              You can also import an SVG if you have a custom asset.
          */}
          <Ionicons name="car-sport" size={60} color={ACCENT_COLOR} />
        </Animated.View>
        {/* --------------------------------------- */}
      </View>
    </Animated.View>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  track: {
    width: SCREEN_W,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },

  /* -------- Text -------- */
  textMaskContainer: {
    position: "absolute",
    height: 60,
    overflow: "hidden",
    left: 0,
  },

  maskedContainer: {
    position: "absolute",
    left: 0,
    height: 60,
    overflow: "hidden",
  },
  mask: {
    height: 60,
    backgroundColor: "#fff",
  },

  appNameText: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    width: SCREEN_W,
  },

  /* -------- Vehicle (formerly bus) -------- */
  busWrapper: {
    // keep the same name to avoid touching the rest of the code
    position: "absolute",
    top: Platform.OS === "ios" ? 5 : 0,
  },
});
