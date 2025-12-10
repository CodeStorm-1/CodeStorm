import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Define the possible vehicle types
type VehicleType = "Bus" | "Car" | "Bike";

// Vehicle details map
const vehicleDetails = {
  Bus: { icon: "directions-bus", defaultSeats: 40, label: "Bus" },
  Car: { icon: "directions-car", defaultSeats: 4, label: "Car" },
  Bike: { icon: "two-wheeler", defaultSeats: 1, label: "Bike" },
};

export default function VehicleSelection() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("Car");
  const [seats, setSeats] = useState<number>(
    vehicleDetails["Car"].defaultSeats
  );

  // Function to handle vehicle selection
  const handleSelectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    // Update seats to the default value for the selected vehicle
    setSeats(vehicleDetails[vehicle].defaultSeats);
  };

  // Function to handle seats input change
  const handleSeatsChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1) {
      setSeats(num);
    } else if (text === "") {
      // Allow clearing the input temporarily
      setSeats(0);
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

  return (
    <View style={styles.container}>
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
          placeholder={`Min. ${vehicleDetails[selectedVehicle].defaultSeats} seats`}
          placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"}
          keyboardAppearance={isDarkMode ? "dark" : "light"}
        />
        <Text style={styles.seatsUnit}>Seats</Text>
      </View>

      {/* 4. Action Button */}
      <TouchableOpacity
        style={
          seats === 0 ? styles.confirmButtonDisabled : styles.confirmButton
        }
        onPress={() =>
          console.log(`Selected: ${selectedVehicle}, Seats: ${seats}`)
        }
        disabled={seats === 0}
      >
        <Text style={styles.confirmButtonText}>
          Confirm Vehicle ({selectedVehicle})
        </Text>
      </TouchableOpacity>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Note: The default seat count is based on the selected vehicle type,
          but you can adjust the capacity above.
        </Text>
      </View>
    </View>
  );
}

// Function to create dynamic styles
const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode ? "#121212" : "#F4F7F9", // Dynamic BG
    },

    heading: {
      fontSize: 26,
      fontWeight: "800",
      marginBottom: 25,
      marginTop: 25,
      color: isDarkMode ? "#E0E0E0" : "#2D3748", // Dynamic Color
    },

    sectionLabel: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDarkMode ? "#CBD5E0" : "#4B5563", // Dynamic Color
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
      borderColor: "#3b82f6", // Blue
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
      color: "#3b82f6", // Blue
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
      color: isDarkMode ? "#F7FAFC" : "#1A202C", // Fix text color
    },

    seatsUnit: {
      marginLeft: 15,
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
    },

    confirmButton: {
      backgroundColor: "#2C7EEA", // Blue
      padding: 16,
      borderRadius: 12,
      marginTop: 30,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 8,
    },

    confirmButtonDisabled: {
      backgroundColor: isDarkMode ? "#4A5568" : "#A0AEC0",
      padding: 16,
      borderRadius: 12,
      marginTop: 30,
      opacity: 0.7,
    },

    confirmButtonText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
    },

    noteBox: {
      marginTop: 25,
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#3b82f6",
      backgroundColor: isDarkMode ? "#1A202C" : "#EBF8FF", // Light blue/dark gray BG
    },

    noteText: {
      fontSize: 14,
      color: isDarkMode ? "#A0AEC0" : "#2C5282",
    },
  });
