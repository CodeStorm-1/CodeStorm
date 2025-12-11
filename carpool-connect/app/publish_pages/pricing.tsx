import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useColorScheme,
  ScrollView,
  Alert,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocationStore } from "@/store/location-store";
import { router } from "expo-router";
import { publish } from "../config/api";
import Toast from "react-native-toast-message";

interface PricingProps {
  routeDistance?: string;
  routeDurationSeconds?: number;
  onSetPrice?: (pricePerKm: number, totalEstimate: number) => void;
}

export default function PricingScreen({
  routeDistance,
  routeDurationSeconds,
  onSetPrice,
}: PricingProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [pricePerKm, setPricePerKm] = useState("15");
  const [customPrice, setCustomPrice] = useState("");
  const [pricingModel, setPricingModel] = useState<"per_km" | "fixed">(
    "per_km"
  );

  const setState = useLocationStore((state) => state.setState);

  const isSaveEnabled =
    pricingModel === "per_km"
      ? pricePerKm.trim().length > 0 &&
        !isNaN(parseFloat(pricePerKm)) &&
        parseFloat(pricePerKm) > 0
      : customPrice.trim().length > 0 &&
        !isNaN(parseFloat(customPrice)) &&
        parseFloat(customPrice) > 0;

  const distanceKm = routeDistance
    ? parseFloat(routeDistance.replace(" km", ""))
    : 0;

  const estimatedTotal =
    pricingModel === "per_km"
      ? Math.round(distanceKm * parseFloat(pricePerKm || "0") * 100) / 100
      : parseFloat(customPrice || "0");

  const handleConfirmPrice = async () => {
    if (!pricePerKm && !customPrice) {
      Alert.alert("Error", "Please enter a price");
      return;
    }

    const finalPrice =
      pricingModel === "per_km"
        ? parseFloat(pricePerKm)
        : parseFloat(customPrice);

    if (onSetPrice) {
      onSetPrice(finalPrice, estimatedTotal);
    }

    setState({
      pricingModel: pricingModel,
      price: finalPrice,
    });

    const resp = await publish();

    if (resp?.ok) {
      Toast.show({
        type: "success",
        text1: resp.message,
      });
    }

    router.push("/(tabs)/your_rides");
  };

  const styles = getStyles(isDarkMode);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>💰 Set Your Price</Text>

      {/* Route Summary */}
      {routeDistance && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="navigation"
              size={20}
              color="#007AFF"
            />
            <Text style={styles.summaryText}>Distance: {routeDistance}</Text>
          </View>

          {routeDurationSeconds && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="clock" size={20} color="#007AFF" />
              <Text style={styles.summaryText}>
                Duration: {Math.round(routeDurationSeconds / 60)} minutes
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Pricing Model Selection */}
      <Text style={styles.sectionLabel}>Choose Pricing Model:</Text>
      <View style={styles.modelRow}>
        {/* Per KM Model */}
        <TouchableOpacity
          style={[
            styles.modelCard,
            pricingModel === "per_km" && styles.modelCardSelected,
          ]}
          onPress={() => setPricingModel("per_km")}
        >
          <MaterialCommunityIcons
            name="road"
            size={32}
            color={pricingModel === "per_km" ? "#3b82f6" : "#999"}
          />
          <Text
            style={[
              styles.modelLabel,
              pricingModel === "per_km" && styles.modelLabelSelected,
            ]}
          >
            Per KM
          </Text>
          <Text style={styles.modelSubtext}>Charge per kilometer</Text>

          {pricingModel === "per_km" && (
            <View style={styles.checkmark}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#34C759"
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Fixed Price */}
        <TouchableOpacity
          style={[
            styles.modelCard,
            pricingModel === "fixed" && styles.modelCardSelected,
          ]}
          onPress={() => setPricingModel("fixed")}
        >
          <MaterialCommunityIcons
            name="tag-multiple"
            size={32}
            color={pricingModel === "fixed" ? "#3b82f6" : "#999"}
          />
          <Text
            style={[
              styles.modelLabel,
              pricingModel === "fixed" && styles.modelLabelSelected,
            ]}
          >
            Fixed Price
          </Text>
          <Text style={styles.modelSubtext}>Charge per seat</Text>

          {pricingModel === "fixed" && (
            <View style={styles.checkmark}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#34C759"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Per KM Input */}
      {pricingModel === "per_km" && (
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Price Per Kilometer (₹)</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              value={pricePerKm}
              onChangeText={setPricePerKm}
              placeholder="15"
              placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>/km</Text>
          </View>

          <Text style={styles.helperText}>
            Common rates: ₹10–20 per km depending on vehicle
          </Text>
        </View>
      )}

      {/* Fixed Price Input */}
      {pricingModel === "fixed" && (
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Price Per Seat (₹)</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>

            <TextInput
              style={styles.input}
              value={customPrice}
              onChangeText={setCustomPrice}
              placeholder="100"
              placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"}
              keyboardType="decimal-pad"
            />

            <Text style={styles.unit}>/seat</Text>
          </View>

          <Text style={styles.helperText}>
            Set a fixed price for the entire ride
          </Text>
        </View>
      )}

      {/* Estimate Box */}
      {estimatedTotal > 0 && (
        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>💡 Estimated Price Breakdown</Text>

          {pricingModel === "per_km" && (
            <>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateText}>Distance</Text>
                <Text style={styles.estimateValue}>{distanceKm} km</Text>
              </View>

              <View style={styles.estimateRow}>
                <Text style={styles.estimateText}>Price per km</Text>
                <Text style={styles.estimateValue}>
                  ₹{parseFloat(pricePerKm).toFixed(2)}
                </Text>
              </View>

              <View style={styles.estimateSeparator} />

              <View style={styles.estimateRow}>
                <Text style={styles.estimateTotalText}>Total (per seat)</Text>
                <Text style={styles.estimateTotalValue}>
                  ₹{estimatedTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}

          {pricingModel === "fixed" && (
            <>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateText}>Price per seat</Text>
                <Text style={styles.estimateValue}>₹{customPrice || "0"}</Text>
              </View>

              <View style={styles.estimateSeparator} />

              <View style={styles.estimateRow}>
                <Text style={styles.estimateTotalText}>Total (per seat)</Text>
                <Text style={styles.estimateTotalValue}>
                  ₹{estimatedTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={20} color="#0066CC" />

        <Text style={styles.infoText}>
          💡 Tip: Competitive prices help attract more passengers.
        </Text>
      </View>

      {/* 🔥 NEW BUTTON — Publish Ride */}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!isSaveEnabled}
        onPress={handleConfirmPrice}
        className={`rounded-2xl px-6 py-5 flex-row items-center border shadow-xl mt-6 ${
          isSaveEnabled
            ? "bg-emerald-700 border-emerald-600"
            : "bg-zinc-700 border-zinc-600 opacity-50"
        }`}
      >
        <MaterialCommunityIcons
          name="send-circle"
          size={26}
          color={isSaveEnabled ? "#A7F3D0" : "#a1a1aa"}
        />

        <Text
          className={`font-semibold ml-4 flex-1 text-base ${
            isSaveEnabled ? "text-white" : "text-zinc-400"
          }`}
        >
          Publish Ride
        </Text>

        <Feather name="arrow-right" size={24} color="#94a3b8" />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode ? "#121212" : "#F4F7F9",
    },
    heading: {
      fontSize: 26,
      fontWeight: "800",
      marginBottom: 20,
      marginTop: 20,
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
      textAlign: "center",
    },
    summaryBox: {
      backgroundColor: isDarkMode ? "#2D3748" : "#E3F2FD",
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: "#007AFF",
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#CBD5E0" : "#1976D2",
      marginLeft: 10,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      color: isDarkMode ? "#CBD5E0" : "#4B5563",
    },
    modelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      gap: 12,
    },
    modelCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDarkMode ? "#4A5568" : "#E2E8F0",
      backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
      alignItems: "center",
      position: "relative",
    },
    modelCardSelected: {
      borderColor: "#3b82f6",
      backgroundColor: isDarkMode
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
    },
    modelLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 8,
      color: isDarkMode ? "#D1D5DB" : "#4B5563",
    },
    modelLabelSelected: {
      color: "#3b82f6",
    },
    modelSubtext: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginTop: 4,
    },
    checkmark: {
      position: "absolute",
      top: 8,
      right: 8,
    },
    inputSection: {
      marginBottom: 20,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#4A5568" : "#CBD5E0",
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    currencySymbol: {
      fontSize: 20,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
      marginRight: 4,
    },
    input: {
      flex: 1,
      padding: 14,
      fontSize: 18,
      color: isDarkMode ? "#F7FAFC" : "#1A202C",
      fontWeight: "600",
    },
    unit: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#A0AEC0" : "#718096",
      marginLeft: 4,
    },
    helperText: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#718096",
      fontStyle: "italic",
    },
    estimateBox: {
      backgroundColor: isDarkMode ? "#1A202C" : "#FFF9E6",
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#FF9800",
    },
    estimateLabel: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 12,
      color: isDarkMode ? "#CBD5E0" : "#D97706",
    },
    estimateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    estimateText: {
      fontSize: 13,
      color: isDarkMode ? "#A0AEC0" : "#666",
    },
    estimateValue: {
      fontSize: 13,
      fontWeight: "600",
      color: isDarkMode ? "#CBD5E0" : "#333",
    },
    estimateSeparator: {
      height: 1,
      backgroundColor: isDarkMode ? "#4A5568" : "#FFE0B2",
      marginVertical: 8,
    },
    estimateTotalText: {
      fontSize: 14,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#D97706",
    },
    estimateTotalValue: {
      fontSize: 16,
      fontWeight: "800",
      color: isDarkMode ? "#FCD34D" : "#F59E0B",
    },
    infoBox: {
      flexDirection: "row",
      backgroundColor: isDarkMode ? "#1A202C" : "#EBF8FF",
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: "#0066CC",
    },
    infoText: {
      fontSize: 13,
      color: isDarkMode ? "#A0AEC0" : "#2C5282",
      marginLeft: 10,
      flex: 1,
      lineHeight: 18,
    },
  });
