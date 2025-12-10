// src/screens/PublishScreen.tsx
import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// -----------------------------------------------------------------
// Refactored DestinationInput Component (for Pickup/Drop)
// -----------------------------------------------------------------
interface DestinationInputProps {
  type: "Pickup" | "Drop";
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const GOOGLE_API_KEY = "AIzaSyBvjcPaK4ZXgLeLjKNZN6i2NamuiHuhDdU"; // Replace with your key

const DestinationInput: React.FC<DestinationInputProps> = ({
  type,
  value,
  onChangeText,
  onClear,
}) => (
  // Vertical padding is py-5 for internal space
  <View className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl px-6 py-5 border border-zinc-800 flex-col justify-center">
    <View className="flex-row items-center">
      <Feather name="map-pin" size={24} color="#94a3b8" />

      <View className="ml-4 flex-1">
        <Text className="text-slate-500 text-sm uppercase tracking-wider font-medium">
          {type}
        </Text>

        {/* Dynamic Address Input */}
        <TextInput
          className="text-white text-xl mt-1 font-medium -ml-0.5"
          placeholder={`Enter ${type} Address`}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="words"
          onSubmitEditing={() => console.log(`${type} entered`)}
        />
      </View>

      {/* Clear Button (only show if there is text) */}
      {value.length > 0 ? (
        <TouchableOpacity onPress={onClear} className="p-1 ml-2">
          <MaterialIcons name="clear" size={24} color="#fca5a5" />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
}
// -----------------------------------------------------------------
// Main PublishScreen Component
// -----------------------------------------------------------------
export default function PublishScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  const [pickup, setPickup] = useState<string>("");
  const [pickupInfo, setPickupInfo] = useState<string>("");
  const [drop, setDrop] = useState<string>("");
  const [sourcePredictions, setSourcePredictions] = useState<PlacePrediction[]>(
    []
  );
  const [destPredictions, setDestPredictions] = useState<PlacePrediction[]>([]);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [openDropModal, setOpenDropModal] = useState(false);

  const isSaveEnabled = pickup.trim().length > 0 && drop.trim().length > 0;

  const fetchPlacePredictions = async (input: string, isSource: boolean) => {
    if (input.length < 3) return;

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_API_KEY}&language=en&components=country:in`;

      const response = await fetch(url);
      const data = await response.json();

      const predictions = data.predictions || [];
      if (isSource) {
        setSourcePredictions(predictions);
      } else {
        setDestPredictions(predictions);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* ---------- Gradient Header ---------- */}
      <LinearGradient
        colors={["#0f172a", "#020617"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
        style={{ paddingTop: top + 20, paddingBottom: 140 }}
        className="absolute inset-0"
      />

      {/* ---------- Main Content with KeyboardAvoidingView ---------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          className="flex-1 px-6"
          style={{ paddingTop: top + 80, paddingBottom: bottom + 120 }}
        >
          {/* ----- Page Title ----- */}
          <View className="items-center mb-8">
            <Text className="text-white text-4xl font-bold tracking-tight">
              New Trip
            </Text>
            <Text className="text-zinc-400 text-sm mt-1">
              {isSaveEnabled
                ? "Ready to publish your trip!"
                : "Enter address details below"}
            </Text>
          </View>

          {/* ----- Destination Inputs (using the new component) ----- */}
          {/* COMBINED both inputs into a single View with space-y-4 */}
          <View className="space-y-4 gap-6 my-4">
            {/* Pickup Input */}
            <DestinationInput
              type="Pickup"
              value={pickupInfo}
              onChangeText={(e) => {
                setPickup(e);
                setPickupInfo(e);
                fetchPlacePredictions(e, true);
              }}
              onClear={() => setPickupInfo("")}
            />
            {pickup.length > 3 ? (
              <View className="absolute left-0 right-0 top-full z-10 bg-white border dark:bg-zinc-800  h-64 mt-2 rounded-md">
                <FlatList
                  data={sourcePredictions}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setPickupInfo(item.description);
                        setPickup("");
                        setOpenPickupModal(false);
                      }}
                      className="px-4 py-4 border-b"
                    >
                      <Text className="dark:text-white">
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.place_id}
                />
              </View>
            ) : (
              <View></View>
            )}
          </View>
          <View className="space-y-4 gap-6 my-2">
            {/* Drop Input */}
            <DestinationInput
              type="Drop"
              value={drop}
              onChangeText={setDrop}
              onClear={() => setDrop("")}
            />
          </View>

          {/* Spacer to push inputs up */}
          <View className="flex-1" />
        </View>
      </KeyboardAvoidingView>

      {/* ---------- Fixed Bottom Action Buttons ---------- */}
      <View
        className="absolute left-0 right-0 px-6"
        style={{ bottom: bottom + 20 }}
      >
        <View className="space-y-3 gap-4">
          {/* Save / Confirm (Disabled if not ready) */}
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!isSaveEnabled}
            onPress={() => {
              router.push("/publish_pages/intermediate");
            }}
            className={`rounded-2xl px-6 py-5 flex-row items-center border shadow-2xl ${
              isSaveEnabled
                ? "bg-emerald-900/90 border-emerald-800 backdrop-blur-2xl"
                : "bg-zinc-700/50 border-zinc-700 backdrop-blur-sm opacity-50"
            }`}
          >
            <MaterialIcons
              name="check-circle"
              size={24}
              color={isSaveEnabled ? "#6ee7b7" : "#a1a1aa"}
            />
            <Text
              className={`font-semibold ml-4 flex-1 text-base ${
                isSaveEnabled ? "text-white" : "text-zinc-400"
              }`}
            >
              Save Trip
            </Text>
            <Feather name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
