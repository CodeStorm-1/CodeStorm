import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useColorScheme,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocationStore } from "@/store/location-store";

// Define the possible vehicle types
type VehicleType = "Bus" | "Car" | "Bike";

// Vehicle details map with max seats added
const vehicleDetails = {
  Bus: { icon: "directions-bus", defaultSeats: 40, maxSeats: 60, label: "Bus" },
  Car: { icon: "directions-car", defaultSeats: 4, maxSeats: 6, label: "Car" },
  Bike: { icon: "two-wheeler", defaultSeats: 1, maxSeats: 1, label: "Bike" },
};

interface VehicleSelectionProps {
  onSelectVehicle?: (vehicle: VehicleType) => void;
  onSetSeats?: (seats: number) => void;
}

export default function VehicleSelection({
  onSelectVehicle,
  onSetSeats,
}: VehicleSelectionProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("Car");
  const [seats, setSeats] = useState<number>(
    vehicleDetails["Car"].defaultSeats
  );
  const setState = useLocationStore((state) => state.setState);

  // Function to handle vehicle selection
  const handleSelectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    // Update seats to the default value for the selected vehicle
    const newSeats = vehicleDetails[vehicle].defaultSeats;
    setSeats(newSeats);
    if (onSelectVehicle) onSelectVehicle(vehicle);
    if (onSetSeats) onSetSeats(newSeats);
  };

  // Function to handle seats input change with max limit validation
  const handleSeatsChange = (text: string) => {
    const num = parseInt(text, 10);
    const maxSeats = vehicleDetails[selectedVehicle].maxSeats;

    if (!isNaN(num) && num >= 1 && num <= maxSeats) {
      setSeats(num);
      if (onSetSeats) onSetSeats(num);
    } else if (text === "") {
      // Allow clearing the input temporarily
      setSeats(0);
      if (onSetSeats) onSetSeats(0);
    }
    // Ignore invalid inputs (0, negative, or exceeding maxSeats)
  };

  // Handle navigation to pricing page
  const handleNext = () => {
    if (seats > 0) {
      setState({ seats: seats });
      setState({ vehicle: selectedVehicle });
      router.push("/publish_pages/pricing");
    }
  };

  // Get dynamic styles based on theme
  const styles = getStyles(isDarkMode);

  const renderVehicleOption = (vehicle: VehicleType) => {
    const { icon, label } = vehicleDetails[vehicle];
    const isSelected = selectedVehicle === vehicle;

    // Determine specific styles for the option card
    const cardStyle = [
      styles.vehicleCardBase,
      isSelected ? styles.vehicleCardSelected : styles.vehicleCardUnselected,
    ];
    const iconColor = isSelected
      ? "#3b82f6"
      : isDarkMode
        ? "#D1D5DB"
        : "#4B5563";
    const textColor = isSelected
      ? styles.vehicleLabelSelected
      : styles.vehicleLabelUnselected;

    return (
      <TouchableOpacity
        key={vehicle}
        style={cardStyle}
        onPress={() => handleSelectVehicle(vehicle)}
      >
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={36}
          color={iconColor}
        />
        <Text style={[styles.vehicleLabelBase, textColor]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const currentMaxSeats = vehicleDetails[selectedVehicle].maxSeats;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Heading */}
      <Text style={styles.heading}>Choose Your Vehicle 🚌</Text>

      {/* 2. Vehicle Selection Row */}
      <Text style={styles.sectionLabel}>Select Vehicle Type:</Text>
      <View style={styles.vehicleRow}>
        {Object.keys(vehicleDetails).map((key) =>
          renderVehicleOption(key as VehicleType)
        )}
      </View>

      {/* 3. Seats/Capacity Input */}
      <Text style={styles.sectionLabel}>Passenger Capacity:</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.seatsInput}
          keyboardType="numeric"
          value={seats > 0 ? seats.toString() : ""}
          onChangeText={handleSeatsChange}
          placeholder={`1 - ${currentMaxSeats} seats`}
          placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"}
          keyboardAppearance={isDarkMode ? "dark" : "light"}
        />
        <Text style={styles.seatsUnit}>Seats</Text>
      </View>

      {/* 4. Note Box */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Note: Max capacity is {currentMaxSeats} seats for{" "}
          {vehicleDetails[selectedVehicle].label}. Default seat count is based
          on vehicle type.
        </Text>
      </View>

      {/* 5. Button Container - Back & Next */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            seats === 0 ? styles.confirmButtonDisabled : styles.confirmButton
          }
          onPress={handleNext}
          disabled={seats === 0}
        >
          <Text style={styles.confirmButtonText}>Next: Set Price →</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// Function to create dynamic styles
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
      marginBottom: 25,
      marginTop: 25,
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
    },

    sectionLabel: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDarkMode ? "#CBD5E0" : "#4B5563",
    },

    vehicleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },

    vehicleCardBase: {
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 2,
      marginHorizontal: 5,
      flex: 1,
    },

    vehicleCardSelected: {
      borderColor: "#3b82f6",
      backgroundColor: isDarkMode
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
    },

    vehicleCardUnselected: {
      borderColor: isDarkMode ? "#4A5568" : "#E2E8F0",
      backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
      shadowColor: isDarkMode ? "#000" : "#E5E7EB",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },

    vehicleLabelBase: {
      marginTop: 8,
      fontSize: 16,
    },

    vehicleLabelSelected: {
      color: "#3b82f6",
      fontWeight: "600",
    },

    vehicleLabelUnselected: {
      color: isDarkMode ? "#D1D5DB" : "#4B5563",
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    seatsInput: {
      flex: 1,
      padding: 15,
      fontSize: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#4A5568" : "#CBD5E0",
      backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
      color: isDarkMode ? "#F7FAFC" : "#1A202C",
    },

    seatsUnit: {
      marginLeft: 15,
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
    },

    noteBox: {
      marginTop: 25,
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#3b82f6",
      backgroundColor: isDarkMode ? "#1A202C" : "#EBF8FF",
      marginBottom: 30,
    },

    noteText: {
      fontSize: 14,
      color: isDarkMode ? "#A0AEC0" : "#2C5282",
      lineHeight: 20,
    },

    // New button container styles
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },

    backButton: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: "#007AFF",
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    backButtonText: {
      color: "#007AFF",
      fontSize: 16,
      fontWeight: "600",
    },

    confirmButton: {
      flex: 1,
      backgroundColor: "#2C7EEA",
      padding: 14,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    confirmButtonDisabled: {
      flex: 1,
      backgroundColor: isDarkMode ? "#4A5568" : "#A0AEC0",
      padding: 14,
      borderRadius: 12,
      opacity: 0.6,
      alignItems: "center",
      justifyContent: "center",
    },

    confirmButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
  });
