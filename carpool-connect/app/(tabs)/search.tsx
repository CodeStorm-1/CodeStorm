// app/index.tsx or your HomeScreen file
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import StarryBackground from "@/components/StarryBackground";
import Constants from "expo-constants";
import { useState } from "react";

const GOOGLE_API = Constants.expoConfig?.extra?.MAPS_API;

export default function HomeScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    if (origin && destination) {
      console.log("Searching:", { origin, destination });
      // router.push(`/search-results?from=${origin}&to=${destination}`);
    }
  };

  return (
    <StarryBackground>
      <View className="flex-1 justify-center items-center px-5">
        <View className="w-full max-w-md">
          {/* BlaBlaCar-style Search Card */}
          <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Find your next ride
            </Text>

            {/* Origin (Departure) - Fixed Autocomplete */}
            <View className="mb-5">
              <GooglePlacesAutocomplete
                placeholder="From where?"
                fetchDetails={true}
                onPress={(data, details = null) => {
                  setOrigin(data.structured_formatting.main_text);
                  console.log("Origin:", data.description);
                }}
                query={{
                  key: "AIzaSyBvjcPaK4ZXgLeLjKNZN6i2NamuiHuhDdU",
                  language: "en",
                }}
                textInputProps={{
                  placeholderTextColor: "#888",
                  clearButtonMode: "while-editing",
                }}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 1000,
                  },
                  textInput: {
                    height: 52,
                    fontSize: 17,
                    backgroundColor: "transparent",
                    borderWidth: 0,
                    paddingLeft: 44,
                    color: "#1f2937",
                    ...Platform.select({
                      ios: { paddingTop: 14 },
                      android: { paddingTop: 14 },
                    }),
                  },
                  listView: {
                    backgroundColor: "white",
                    borderRadius: 12,
                    marginTop: 8,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    zIndex: 1000,
                    maxHeight: 320,
                  },
                  row: {
                    padding: 14,
                    height: 56,
                  },
                  description: {
                    fontSize: 15,
                  },
                  poweredContainer: { display: "none" },
                }}
                renderLeftButton={() => (
                  <View className="absolute left-0 top-0 bottom-0 justify-center pl-4 z-10 pointer-events-none">
                    <FontAwesome5
                      name="map-marker-alt"
                      size={22}
                      color="#EF4444"
                    />
                  </View>
                )}
                enablePoweredByContainer={false}
                debounce={300}
              />
              <View className="h-px bg-gray-300 dark:bg-zinc-600 -mt-1" />
            </View>

            {/* Destination */}
            <View className="flex-row items-center border-b border-gray-300 dark:border-zinc-600 py-3 mb-5">
              <FontAwesome5
                name="map-marker-alt"
                size={22}
                color="#3B82F6"
                className="ml-1"
              />
              <TextInput
                placeholder="Going to..."
                placeholderTextColor="#888"
                value={destination}
                onChangeText={setDestination}
                className="flex-1 ml-4 text-lg text-gray-800 dark:text-white"
              />
            </View>

            {/* Date Picker */}
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 dark:border-zinc-600 py-4 mb-8">
              <View className="flex-row items-center">
                <AntDesign name="calendar" size={22} color="#888" />
                <Text className="ml-3 text-lg text-gray-700 dark:text-gray-300">
                  Tomorrow, Dec 11
                </Text>
              </View>
              <AntDesign name="right" size={18} color="#888" />
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              onPress={handleSearch}
              disabled={!origin || !destination}
              className={`py-4 rounded-xl ${
                origin && destination
                  ? "bg-black dark:bg-white"
                  : "bg-gray-400 dark:bg-gray-600"
              }`}
            >
              <Text
                className={`text-center text-xl font-bold ${
                  origin && destination
                    ? "text-white dark:text-black"
                    : "text-gray-200"
                }`}
              >
                Search Rides
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Searches */}
          <View className="mt-10">
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Recent searches
            </Text>
            <View className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No recent searches yet.
              </Text>
            </View>
          </View>

          {/* Test Navigation */}
          <TouchableOpacity
            className="mt-8"
            onPress={() => router.push("./(auth)/signup/emailPage")}
          >
            <Text className="text-blue-500 text-center underline">
              Go to Email Sign Up (Test)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </StarryBackground>
  );
}
