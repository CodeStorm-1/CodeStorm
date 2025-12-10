import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme, // <-- Import the necessary hook
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// Define the type for the stop list item with a unique ID
interface StopItem {
  id: number;
  name: string;
}

export default function Intermediate() {
  // 1. Theme detection
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [stopInput, setStopInput] = useState("");
  const [stops, setStops] = useState<StopItem[]>([]);

  const addStop = () => {
    if (stopInput.trim() !== "") {
      const newStop: StopItem = {
        id: Date.now(), // Unique ID for key
        name: stopInput.trim(),
      };
      // Prepend the new stop to show it at the top
      setStops([newStop, ...stops]);
      setStopInput("");
    }
  };

  // Get dynamic styles based on the theme
  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Intermediate Stops</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter stop name"
          placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"} // Better contrast in both modes
          style={styles.input}
          value={stopInput}
          onChangeText={setStopInput}
          // 2. FIX FOR DARK MODE TEXT: Sets the keyboard appearance correctly
          keyboardAppearance={isDarkMode ? "dark" : "light"}
        />
        <TouchableOpacity
          onPress={addStop}
          style={[
            styles.addBtn,
            stopInput.trim() === "" && styles.addBtnDisabled,
          ]}
          // Disable button if input is empty
          disabled={stopInput.trim() === ""}
        >
          <MaterialIcons name="add-location" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Separator for clarity */}
      <View style={styles.separator} />

      <FlatList
        data={stops}
        // Use the unique ID for keyExtractor
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            No stops added yet. Start planning your route!
          </Text>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.stopItem}>
            <View style={styles.stopIconContainer}>
              {/* Use a clear visual indicator for the stop number */}
              <Text style={styles.stopNumberCircle}>{index + 1}</Text>
            </View>
            <Text style={styles.stopText}>{item.name}</Text>
          </View>
        )}
      />
      <View className="space-y-3 gap-4">
        {/* Save / Confirm (Disabled if not ready) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            router.push("/publish_pages/map");
          }}
          className={`rounded-2xl px-6 py-5 flex-row items-center border shadow-2xl "bg-emerald-900/90 border-emerald-800 backdrop-blur-2xl`}
        >
          <Text className={`font-semibold ml-4 flex-1 text-base text-white`}>
            Skip
          </Text>
          <Feather name="chevron-right" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Function to create dynamic styles based on the theme
const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 64,
      padding: 20,
      // Dynamic background color
      backgroundColor: isDarkMode ? "#121212" : "#F4F7F9",
    },

    heading: {
      fontSize: 26,
      fontWeight: "800",
      marginBottom: 25,
      // Dynamic text color
      color: isDarkMode ? "#E0E0E0" : "#2D3748",
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    input: {
      flex: 1,
      borderWidth: 1,
      // Dynamic border and text color
      borderColor: isDarkMode ? "#4A5568" : "#CBD5E0",
      padding: 14,
      borderRadius: 12,
      fontSize: 17,
      // FIX: Dynamic text color for input field
      color: isDarkMode ? "#F7FAFC" : "#1A202C",
      backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
    },

    addBtn: {
      backgroundColor: "#2C7EEA", // A modern blue
      padding: 14,
      borderRadius: 12,
      marginLeft: 10,
      justifyContent: "center",
      alignItems: "center",
      // Slight shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },

    addBtnDisabled: {
      backgroundColor: isDarkMode ? "#4A5568" : "#A0AEC0",
      opacity: 0.6,
      elevation: 0,
    },

    separator: {
      height: 1,
      backgroundColor: isDarkMode ? "#2D3748" : "#E2E8F0",
      marginVertical: 10,
    },

    stopItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      // Dynamic stop item background (Card Look)
      backgroundColor: isDarkMode ? "#1A202C" : "#FFFFFF",
      borderRadius: 12,
      marginBottom: 10,
      // Better shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1.5,
      elevation: 2,
      borderLeftWidth: 4, // Highlight border
      borderLeftColor: "#48BB78", // A nice green color
    },

    stopIconContainer: {
      marginRight: 10,
    },

    stopNumberCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#48BB78", // Green background
      color: "white",
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: 24, // Center text vertically
    },

    stopText: {
      // Dynamic text color
      color: isDarkMode ? "#F7FAFC" : "#2D3748",
      fontSize: 17,
      fontWeight: "500",
      flexShrink: 1,
    },

    emptyText: {
      textAlign: "center",
      marginTop: 50,
      fontSize: 16,
      // Dynamic text color
      color: isDarkMode ? "#A0AEC0" : "#718096",
      fontStyle: "italic",
    },
  });
