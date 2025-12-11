// app/index.tsx or your HomeScreen file
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import StarryBackground from "@/components/StarryBackground";
import Constants from "expo-constants";
import { useState } from "react";
import { useUserStore } from "@/store/user-store";

const GOOGLE_API = Constants.expoConfig?.extra?.MAPS_API;
// Adjust to your backend
const API_BASE_URL = "http://10.130.91.206:3000/api";

type Coordinate = { latitude: number; longitude: number };

type Ride = {
  id: string;
  driverName: string;
  startAddress: string;
  endAddress: string;
  startTime: string; // ISO
  seatsLeft: number;
  pricePerSeat: number;
  routePoints: Coordinate[]; // decoded polyline points
};

type ScoredRide = Ride & {
  pickupDistance: number;
  dropDistance: number;
  score: number;
};

export default function HomeScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [originCoord, setOriginCoord] = useState<Coordinate | null>(null);
  const [destCoord, setDestCoord] = useState<Coordinate | null>(null);

  const [radiusMeters, setRadiusMeters] = useState(1000); // 1 km default
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredRide[]>([]);

  const handleSearch = async () => {
    if (!origin || !destination || !originCoord || !destCoord) return;

    try {
      setLoading(true);

      // 1) Fetch rides from backend
      const res = await fetch(`${API_BASE_URL}/rides`);
      if (!res.ok) {
        throw new Error("Failed to fetch rides");
      }
      const ridesData: Ride[] = await res.json();

      // 2) Score & filter
      const scored: ScoredRide[] = ridesData
        .map((ride) => {
          const pickupDist = minDistancePointToRoute(
            originCoord,
            ride.routePoints
          );
          const dropDist = minDistancePointToRoute(destCoord, ride.routePoints);

          const pickupIndex = nearestPointIndex(originCoord, ride.routePoints);
          const dropIndex = nearestPointIndex(destCoord, ride.routePoints);
          const isOrderValid = pickupIndex < dropIndex;

          const score = pickupDist + dropDist;

          return {
            ...ride,
            pickupDistance: pickupDist,
            dropDistance: dropDist,
            score: isOrderValid ? score : Number.POSITIVE_INFINITY,
          };
        })
        .filter(
          (r) =>
            r.score !== Number.POSITIVE_INFINITY &&
            r.pickupDistance <= radiusMeters &&
            r.dropDistance <= radiusMeters
        )
        .sort((a, b) => a.score - b.score);

      setResults(scored);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Haversine distance (meters)
  function haversine(a: Coordinate, b: Coordinate): number {
    const R = 6371000;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;

    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);

    const aa =
      sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  // Approx: min distance from point to route (nearest vertex)
  function minDistancePointToRoute(p: Coordinate, route: Coordinate[]): number {
    if (!route.length) return Number.POSITIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < route.length; i++) {
      const d = haversine(p, route[i]);
      if (d < min) min = d;
    }
    return min;
  }

  function nearestPointIndex(p: Coordinate, route: Coordinate[]): number {
    if (!route.length) return -1;
    let min = Number.POSITIVE_INFINITY;
    let idx = -1;
    for (let i = 0; i < route.length; i++) {
      const d = haversine(p, route[i]);
      if (d < min) {
        min = d;
        idx = i;
      }
    }
    return idx;
  }

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

  return (
    <StarryBackground>
      <View className="flex-1 justify-center items-center px-5">
        <View className="w-full max-w-md">
          {/* BlaBlaCar-style Search Card */}
          <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Find your next ride
            </Text>

            {/* Origin Autocomplete */}
            <View className="mb-5">
              <GooglePlacesAutocomplete
                placeholder="From where?"
                fetchDetails={true}
                onPress={(data, details = null) => {
                  setOrigin(data.structured_formatting.main_text);
                  if (details?.geometry?.location) {
                    setOriginCoord({
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    });
                  }
                  console.log("Origin:", data.description);
                }}
                query={{
                  key: GOOGLE_API,
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

            {/* Date Picker placeholder */}
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
              disabled={!origin || !destination || !originCoord || !destCoord}
              className={`py-4 rounded-xl ${
                origin && destination && originCoord && destCoord
                  ? "bg-black dark:bg-white"
                  : "bg-gray-400 dark:bg-gray-600"
              }`}
            >
              <Text
                className={`text-center text-xl font-bold ${
                  origin && destination && originCoord && destCoord
                    ? "text-white dark:text-black"
                    : "text-gray-200"
                }`}
              >
                {loading ? "Searching..." : "Search Rides"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results list (below card, UI kept simple) */}
          {loading && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          )}

          {!loading && results.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Best matches
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderRide}
                scrollEnabled={false}
              />
            </View>
          )}

          {!loading && results.length === 0 && (
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
          )}

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
