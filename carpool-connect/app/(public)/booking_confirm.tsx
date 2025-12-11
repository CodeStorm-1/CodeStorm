// app/booking/confirmation.tsx
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const params = useLocalSearchParams();
  const rideId = params.rideId as string | undefined;
  const driverName = (params.driverName as string | undefined) ?? "Driver";

  const [isLoading, setIsLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookingId(`BK${Date.now().toString().slice(-8)}`);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const styles = getStyles(isDarkMode);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Confirming your booking...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Success Block */}
      <View style={styles.successBlock}>
        <View style={styles.successCircle}>
          <MaterialCommunityIcons name="check" size={56} color="#34C759" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed</Text>
        <Text style={styles.successSub}>
          Your ride has been booked. The driver has been notified.
        </Text>
      </View>

      {/* Driver Card (no ratings) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Driver</Text>
        <View style={styles.driverRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driverName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <View style={styles.driverVehicleRow}>
              <MaterialCommunityIcons name="car" size={16} color="#007AFF" />
              <Text style={styles.driverVehicleText}>
                Hyundai Creta • MH01AB1234
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.driverButtonsRow}>
          <TouchableOpacity style={styles.outlineBtn}>
            <MaterialCommunityIcons name="phone" size={18} color="#007AFF" />
            <Text style={styles.outlineBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn}>
            <MaterialCommunityIcons name="message" size={18} color="#007AFF" />
            <Text style={styles.outlineBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Booking Details</Text>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="identifier" size={20} color="#007AFF" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>{bookingId}</Text>
          </View>
        </View>

        {rideId && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="ticket-confirmation"
              size={20}
              color="#007AFF"
            />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ride ID</Text>
              <Text style={styles.detailValue}>{rideId}</Text>
            </View>
          </View>
        )}

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={20}
            color="#007AFF"
          />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color="#007AFF"
          />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Pickup Time</Text>
            <Text style={styles.detailValue}>09:30 AM</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#007AFF" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Pickup Location</Text>
            <Text style={styles.detailValue}>19.076°N, 72.877°E</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="navigation" size={20} color="#007AFF" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Drop Location</Text>
            <Text style={styles.detailValue}>19.218°N, 72.978°E</Text>
          </View>
        </View>
      </View>

      {/* Price Summary (only total amount) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Summary</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total Amount</Text>
            <Text style={styles.priceTotalValue}>₹290</Text>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What Happens Next?</Text>

        <View style={styles.stepRow}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepCircleText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Driver will contact you</Text>
            <Text style={styles.stepText}>
              You may receive a call or message from the driver to confirm
              pickup.
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepCircleText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Be ready at pickup point</Text>
            <Text style={styles.stepText}>
              Reach the pickup spot a few minutes before the scheduled time.
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepCircleText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enjoy your ride</Text>
            <Text style={styles.stepText}>
              Travel safely and share the ride with other passengers.
            </Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonBlock}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            router.push("/"); // change to "/(tabs)/home" if needed
          }}
        >
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            router.push("/"); // change to "/(tabs)/bookings" if you have it
          }}
        >
          <Text style={styles.secondaryBtnText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F8F9FA",
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333333",
    },
    successBlock: {
      alignItems: "center",
      marginBottom: 24,
      marginTop: 8,
    },
    successCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: "#E8F5E9",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333333",
      marginBottom: 4,
    },
    successSub: {
      fontSize: 13,
      textAlign: "center",
      color: isDarkMode ? "#A0AEC0" : "#666666",
    },
    card: {
      backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2D2D2D" : "#E0E0E0",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333333",
      marginBottom: 12,
    },
    driverRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#007AFF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 26,
      fontWeight: "700",
    },
    driverInfo: {
      flex: 1,
    },
    driverName: {
      fontSize: 17,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333333",
      marginBottom: 6,
    },
    driverVehicleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    driverVehicleText: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#666666",
      marginLeft: 6,
      fontWeight: "500",
    },
    driverButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    outlineBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#007AFF",
      borderRadius: 8,
      paddingVertical: 10,
      gap: 6,
    },
    outlineBtnText: {
      color: "#007AFF",
      fontWeight: "600",
      fontSize: 13,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    detailContent: {
      marginLeft: 10,
      flex: 1,
    },
    detailLabel: {
      fontSize: 11,
      color: isDarkMode ? "#A0AEC0" : "#999999",
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333333",
    },
    priceBox: {
      backgroundColor: isDarkMode ? "#2D2D2D" : "#F8F9FA",
      borderRadius: 10,
      padding: 12,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    priceTotalLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333333",
    },
    priceTotalValue: {
      fontSize: 20,
      fontWeight: "700",
      color: "#007AFF",
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    stepCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#007AFF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      marginTop: 2,
    },
    stepCircleText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333333",
      marginBottom: 3,
    },
    stepText: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#777777",
      lineHeight: 18,
    },
    buttonBlock: {
      marginTop: 10,
      marginBottom: 20,
      gap: 10,
    },
    primaryBtn: {
      backgroundColor: "#007AFF",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
    secondaryBtn: {
      backgroundColor: "transparent",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#007AFF",
    },
    secondaryBtnText: {
      color: "#007AFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
