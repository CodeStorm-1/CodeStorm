// app/index.tsx or your HomeScreen file
import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import StarryBackground from "@/components/StarryBackground";
import Constants from "expo-constants";
import { useUserStore } from "@/store/user-store";
import { useSearchStore } from "@/store/search-store";

const GOOGLE_API = Constants.expoConfig?.extra?.MAPS_API;
const API_BASE_URL = "http://10.130.91.206:3000/api";

type Coordinate = { latitude: number; longitude: number };

type Ride = {
  id: string;
  driverName: string;
  startAddress: string;
  endAddress: string;
  startTime: string;
  seatsLeft: number;
  pricePerSeat: number;
  routePoints: Coordinate[];
};

type ScoredRide = Ride & {
  pickupDistance: number;
  dropDistance: number;
  score: number;
};

type PlacePrediction = {
  place_id: string;
  description: string;
  main_text: string;
};

type PlaceDetails = {
  latitude: number;
  longitude: number;
  address: string;
};

export default function HomeScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [originCoord, setOriginCoord] = useState<PlaceDetails | null>(null);
  const [destCoord, setDestCoord] = useState<PlaceDetails | null>(null);

  const [originPredictions, setOriginPredictions] = useState<PlacePrediction[]>(
    []
  );
  const [destPredictions, setDestPredictions] = useState<PlacePrediction[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<
    "origin" | "destination" | null
  >(null);

  const setSource = useSearchStore((set) => set.setSource);
  const setDest = useSearchStore((set) => set.setDestination);
  const setDate = useSearchStore((set) => set.setDate);

  const [radiusMeters, setRadiusMeters] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredRide[]>([]);

  // Fetch place predictions from Google API
  const fetchPlacePredictions = async (input: string, isOrigin: boolean) => {
    if (input.length < 3) {
      isOrigin ? setOriginPredictions([]) : setDestPredictions([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_API}&language=en&components=country:in`;

      const response = await fetch(url);
      const data = await response.json();
      const predictions = data.predictions || [];

      if (isOrigin) {
        setOriginPredictions(predictions);
      } else {
        setDestPredictions(predictions);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  // Get detailed place information
  const getPlaceDetails = async (placeId: string, isOrigin: boolean) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API}&fields=geometry,formatted_address,name`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        const result = data.result;
        const placeInfo: PlaceDetails = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };

        if (isOrigin) {
          setOriginCoord(placeInfo);
          setOrigin(result.formatted_address);
          setOriginPredictions([]);
          setFocusedInput(null);
        } else {
          setDestCoord(placeInfo);
          setDestination(result.formatted_address);
          setDestPredictions([]);
          setFocusedInput(null);
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleSearch = async () => {
    if (
      !origin ||
      !destination ||
      !originCoord ||
      !destCoord ||
      !selectedDate
    ) {
      alert("Please fill all fields including date");
      return;
    }

    try {
      setLoading(true);
      setSource(originCoord);
      setDest(destCoord);
      setDate(selectedDate);

      router.push("/search_results");
    } catch (e) {
      console.error(e);
      alert("Error searching rides");
    } finally {
      setLoading(false);
    }
  };

  const renderRide = ({ item }: { item: ScoredRide }) => (
    <View className="mt-3 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
      <View className="flex-row justify-between mb-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {item.driverName}
        </Text>
        <Text className="text-base font-bold text-blue-500">
          ₹{item.pricePerSeat.toFixed(0)}/seat
        </Text>
      </View>
      <Text
        className="text-xs text-gray-500 dark:text-gray-400"
        numberOfLines={1}
      >
        {item.startAddress}
      </Text>
      <Text
        className="text-xs text-gray-500 dark:text-gray-400"
        numberOfLines={1}
      >
        → {item.endAddress}
      </Text>
      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          🕒{" "}
          {new Date(item.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          👥 {item.seatsLeft} seats left
        </Text>
      </View>
      <View className="mt-1">
        <Text className="text-[11px] text-gray-500 dark:text-gray-400">
          Pickup ~ {(item.pickupDistance / 1000).toFixed(2)} km from your point,
          Drop ~ {(item.dropDistance / 1000).toFixed(2)} km
        </Text>
      </View>
    </View>
  );

  const renderOriginPredictions = () => {
    if (originPredictions.length === 0 || focusedInput !== "origin")
      return null;

    return (
      <View className="absolute top-16 left-0 right-0 bg-white dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600 max-h-64 z-50">
        <FlatList
          data={originPredictions}
          keyExtractor={(item) => item.place_id}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => getPlaceDetails(item.place_id, true)}
              className="px-4 py-3 border-b border-gray-100 dark:border-zinc-600"
            >
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.main_text}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderDestPredictions = () => {
    if (destPredictions.length === 0 || focusedInput !== "destination")
      return null;

    return (
      <View className="absolute top-32 left-0 right-0 bg-white dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600 max-h-64 z-50">
        <FlatList
          data={destPredictions}
          keyExtractor={(item) => item.place_id}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => getPlaceDetails(item.place_id, false)}
              className="px-4 py-3 border-b border-gray-100 dark:border-zinc-600"
            >
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.main_text}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Calendar picker component
  const CalendarPicker = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    ).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const handleDateSelect = (day: number | null) => {
      if (day === null) return;
      const selected = new Date(today.getFullYear(), today.getMonth(), day);
      selected.setHours(0, 0, 0, 0);

      // Check if date is today or future AND within next 7 days
      if (selected >= today && selected <= nextWeek) {
        setSelectedDate(selected);
        setShowDatePicker(false);
      }
    };

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowDatePicker(false)}
        >
          <View className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-11/12 max-w-sm">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {today.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <AntDesign name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Day names */}
            <View className="flex-row justify-between mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text
                  key={day}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-12 text-center"
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row justify-between mb-2">
                {week.map((day, dayIndex) => {
                  let isDisabled = false;
                  let isToday = false;

                  if (day !== null) {
                    const cellDate = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      day
                    );
                    cellDate.setHours(0, 0, 0, 0);
                    isToday = cellDate.getTime() === today.getTime();
                    isDisabled = cellDate < today || cellDate > nextWeek;
                  } else {
                    isDisabled = true;
                  }

                  const isSelected =
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === today.getMonth() &&
                    selectedDate?.getFullYear() === today.getFullYear();

                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      onPress={() => handleDateSelect(day)}
                      disabled={isDisabled}
                      className={`w-12 h-12 rounded-lg items-center justify-center ${
                        isSelected
                          ? "bg-blue-500"
                          : isToday && !isDisabled
                            ? "bg-blue-100 dark:bg-blue-900"
                            : isDisabled
                              ? "bg-gray-100 dark:bg-zinc-700"
                              : "bg-gray-50 dark:bg-zinc-700"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-white font-bold"
                            : isDisabled
                              ? "text-gray-400 dark:text-gray-600"
                              : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Confirm button */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              className="mt-6 bg-blue-500 rounded-lg py-3"
            >
              <Text className="text-white font-bold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <StarryBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1 justify-start items-center px-5 pt-20">
          <View className="w-full max-w-md">
            {/* BlaBlaCar-style Search Card */}
            <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700">
              <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Find your next ride
              </Text>

              {/* Origin Input */}
              <View className="mb-12">
                <View
                  className={`flex-row items-center border-b-2 py-3 relative ${
                    focusedInput === "origin"
                      ? "border-blue-500"
                      : "border-gray-300 dark:border-zinc-600"
                  }`}
                >
                  <FontAwesome5
                    name="map-marker-alt"
                    size={22}
                    color="#EF4444"
                  />
                  <TextInput
                    placeholder="From where?"
                    placeholderTextColor="#888"
                    value={origin}
                    onChangeText={(text) => {
                      setOrigin(text);
                      if (text === "") {
                        setOriginCoord(null);
                      }
                      fetchPlacePredictions(text, true);
                    }}
                    onFocus={() => setFocusedInput("origin")}
                    className="flex-1 ml-4 text-lg text-gray-800 dark:text-white"
                  />
                  {origin.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setOrigin("");
                        setOriginCoord(null);
                        setOriginPredictions([]);
                      }}
                    >
                      <AntDesign name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
                {renderOriginPredictions()}
              </View>

              {/* Destination Input */}
              <View className="mb-12">
                <View
                  className={`flex-row items-center border-b-2 py-3 relative ${
                    focusedInput === "destination"
                      ? "border-blue-500"
                      : "border-gray-300 dark:border-zinc-600"
                  }`}
                >
                  <FontAwesome5
                    name="map-marker-alt"
                    size={22}
                    color="#3B82F6"
                  />
                  <TextInput
                    placeholder="Going to..."
                    placeholderTextColor="#888"
                    value={destination}
                    onChangeText={(text) => {
                      setDestination(text);
                      if (text === "") {
                        setDestCoord(null);
                      }
                      fetchPlacePredictions(text, false);
                    }}
                    onFocus={() => setFocusedInput("destination")}
                    className="flex-1 ml-4 text-lg text-gray-800 dark:text-white"
                  />
                  {destination.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setDestination("");
                        setDestCoord(null);
                        setDestPredictions([]);
                      }}
                    >
                      <AntDesign name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
                {renderDestPredictions()}
              </View>

              {/* Date Picker */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between border-b-2 border-gray-300 dark:border-zinc-600 py-4 mb-8"
              >
                <View className="flex-row items-center">
                  <AntDesign name="calendar" size={22} color="#888" />
                  <Text className="ml-3 text-lg text-gray-700 dark:text-gray-300">
                    {formattedDate || "Select date"}
                  </Text>
                </View>
                <AntDesign name="right" size={18} color="#888" />
              </TouchableOpacity>

              {/* Search Button */}
              <TouchableOpacity
                onPress={handleSearch}
                disabled={
                  !origin ||
                  !destination ||
                  !originCoord ||
                  !destCoord ||
                  !selectedDate ||
                  loading
                }
                className={`py-4 rounded-xl flex-row items-center justify-center ${
                  origin &&
                  destination &&
                  originCoord &&
                  destCoord &&
                  selectedDate
                    ? "bg-black dark:bg-white"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
              >
                {loading ? (
                  <ActivityIndicator
                    color={
                      origin &&
                      destination &&
                      originCoord &&
                      destCoord &&
                      selectedDate
                        ? "white"
                        : "#999"
                    }
                    size="small"
                  />
                ) : (
                  <Text
                    className={`text-center text-xl font-bold ${
                      origin &&
                      destination &&
                      originCoord &&
                      destCoord &&
                      selectedDate
                        ? "text-white dark:text-black"
                        : "text-gray-200"
                    }`}
                  >
                    Search Rides
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Results list */}
            {loading && (
              <View className="mt-6 items-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            {!loading && results.length > 0 && (
              <View className="mt-6 max-h-80">
                <Text className="text-lg font-semibold text-gray-200 mb-2">
                  Best matches ({results.length})
                </Text>
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRide}
                  scrollEnabled={true}
                />
              </View>
            )}

            {!loading && results.length === 0 && origin && (
              <View className="mt-10">
                <Text className="text-lg font-semibold text-gray-400 mb-3">
                  No rides found
                </Text>
                <View className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <Text className="text-gray-500 dark:text-gray-400 text-center">
                    Try adjusting your search criteria
                  </Text>
                </View>
              </View>
            )}

            {/* Test Navigation */}
            <TouchableOpacity
              className="mt-8 mb-10"
              onPress={() => router.push("./(auth)/signup/emailPage")}
            >
              <Text className="text-blue-400 text-center underline">
                Go to Email Sign Up (Test)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Calendar Modal */}
      <CalendarPicker />
    </StarryBackground>
  );
}
