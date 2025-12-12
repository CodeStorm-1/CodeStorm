import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "@/store/location-store";
import { useDriverRouteStore } from "@/store/driverRoute-store";
import { router } from "expo-router";
import { set } from "date-fns";
import { useUserStore } from "@/store/user-store";

const GOOGLE_API_KEY = "AIzaSyBvjcPaK4ZXgLeLjKNZN6i2NamuiHuhDdU"; // Replace with your key

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
}

interface Route {
  id: string;
  distance: string;
  duration: string;
  durationValue: number;
  distanceValue: number;
  points: Array<{ latitude: number; longitude: number }>;
  polyline: string;
}

export default function PublishRide() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);

  // Input states
  const [sourceInput, setSourceInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [sourcePredictions, setSourcePredictions] = useState<PlacePrediction[]>(
    []
  );
  const [destPredictions, setDestPredictions] = useState<PlacePrediction[]>([]);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);

  const source = useLocationStore((state) => state.pickupInfo);
  const destination = useLocationStore((state) => state.destInfo);

  const setState = useLocationStore((state) => state.setState);
  const id = useUserStore((state) => state.id);
  const name = useUserStore((state) => state.name);
  const phone = useUserStore((state) => state.phone);

  const setUserId = useDriverRouteStore((state) => state.setUserId);
  const setPoints = useDriverRouteStore((state) => state.setPoints);

  // Fetch routes between source and destination
  const fetchRoutes = async () => {
    if (!source || !destination) {
      return;
    }

    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${source.latitude},${source.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}&alternatives=true&mode=driving`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length === 0) {
        Alert.alert(
          "No routes found",
          "Could not find a route between these locations"
        );
        setLoading(false);
        return;
      }

      const parsedRoutes: Route[] = data.routes
        .map((route: any, index: number) => {
          const leg = route.legs[0];
          const points = decodePolyline(route.overview_polyline.points);
          const durationValue = leg.duration.value;

          return {
            id: `route-${index}`,
            distance: leg.distance.text,
            duration: leg.duration.text,
            durationValue: durationValue,
            distanceValue: leg.distance.value,
            points: points,
            polyline: route.overview_polyline.points,
          };
        })
        .sort((a: Route, b: Route) => a.durationValue - b.durationValue);

      setRoutes(parsedRoutes);
      setSelectedRoute(parsedRoutes[0]); // Auto-select fastest route
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "Failed to fetch routes. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  // Decode polyline
  function decodePolyline(encoded: string) {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let result = 0;
      let shift = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      lat += result & 1 ? ~(result >> 1) : result >> 1;

      result = 0;
      shift = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      lng += result & 1 ? ~(result >> 1) : result >> 1;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  // Calculate map region
  const getMapRegion = () => {
    if (!source || !destination) return null;

    const minLat = Math.min(source.latitude!, destination.latitude!);
    const maxLat = Math.max(source.latitude!, destination.latitude!);
    const minLng = Math.min(source.longitude!, destination.longitude!);
    const maxLng = Math.max(source.longitude!, destination.longitude!);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat + 0.05,
      longitudeDelta: maxLng - minLng + 0.05,
    };
  };

  const mapRegion = getMapRegion();

  const handleContinue = () => {
    if (selectedRoute) {
      setState({
        encodedPolyline: selectedRoute.polyline,
      });
      setState({
        id: id,
        name: name,
        phone: phone,
      });
      setUserId(id!);
      setPoints(selectedRoute.points);
      router.push("/publish_pages/datetime");
    }
  };

  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, destination]);

  return (
    <View className="flex-1 bg-[#f5f5f5]">
      {/* Map View */}
      {mapRegion ? (
        <MapView
          style={{ height: "55%", width: "100%" }}
          initialRegion={mapRegion}
        >
          {source && (
            <Marker
              coordinate={{
                latitude: source.latitude!,
                longitude: source.longitude!,
              }}
              title="Pickup"
              pinColor="green"
            />
          )}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.latitude!,
                longitude: destination.longitude!,
              }}
              title="Dropoff"
              pinColor="red"
            />
          )}
          {selectedRoute && selectedRoute.points.length > 0 && (
            <Polyline
              coordinates={selectedRoute.points}
              strokeColor="#007AFF"
              strokeWidth={5}
            />
          )}
        </MapView>
      ) : (
        <View className="h-[45%] justify-center items-center bg-[#e8e8e8]">
          <Text className="text-sm text-[#666] text-center">
            Select source & destination to see map
          </Text>
        </View>
      )}

      {/* Bottom Form */}
      <ScrollView
        className="flex-1 bg-zinc-900 px-4 pt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Routes Display */}
        {routes.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-300 mb-2">
              Available Routes (Sorted by fastest)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {routes.map((route, index) => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <TouchableOpacity
                    key={route.id}
                    className={`min-w-[140px] mr-3 rounded-xl p-4 justify-center border-2 
                      ${
                        isSelected
                          ? "bg-[#E3F2FD] dark:bg-[#1E3A5F] border-[#007AFF] dark:border-[#4DA3FF]"
                          : "bg-[#F5F5F5] dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#333]"
                      }
                    `}
                    onPress={() => setSelectedRoute(route)}
                  >
                    <View className="items-center">
                      <Text className="text-xs text-gray-400 mb-2 font-medium">
                        Route {index + 1}
                      </Text>
                      <Text className="text-lg font-extrabold text-white">
                        {route.duration}
                      </Text>
                      <Text className="text-sm text-white mt-1">
                        {route.distance}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="absolute top-1 right-1">
                        <Ionicons
                          name="checkmark-circle-sharp"
                          size={28}
                          color="#34C759"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Selected Route Info */}
        {selectedRoute && (
          <View
            className="bg-zinc-800/5 border-zinc-500 rounded-xl p-4 mb-4"
            style={{ borderLeftWidth: 3, borderLeftColor: "#34C759" }}
          >
            <Text className="text-base font-semibold text-[#2E7D32] mb-2">
              ✓ Route Selected
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={18} color="#007AFF" />
              <Text className="text-sm text-[#1976D2] ml-2 font-medium">
                {selectedRoute.duration}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="navigate" size={18} color="#007AFF" />
              <Text className="text-sm text-[#1976D2] ml-2 font-medium">
                {selectedRoute.distance}
              </Text>
            </View>
          </View>
        )}

        {/* Continue Button */}
        {selectedRoute && (
          <TouchableOpacity
            className="bg-[#34C759] py-3 rounded-xl items-center mb-6 shadow"
            onPress={handleContinue}
          >
            <Text className="text-white text-base font-semibold">
              Select Route
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Modals for source/destination (kept structure; wire up where needed) */}
      <Modal visible={showSourceModal} animationType="slide" transparent>
        <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
          <View className="bg-white rounded-t-[20px] h-[75%] pt-4">
            <View className="flex-row justify-between items-center px-4 pb-3 border-b border-[#EEE]">
              <Text className="text-lg font-semibold text-[#333]">Select</Text>
              <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                <Text className="text-[#007AFF]">Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={sourceInput}
              onChangeText={setSourceInput}
              placeholder="Search for a place"
              className="mx-4 my-3 border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-base text-[#333]"
            />

            <FlatList
              data={sourcePredictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex-row items-start px-4 py-3 border-b border-[#F5F5F5]">
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-[#333]">
                      {item.main_text}
                    </Text>
                    <Text className="text-xs text-[#999] mt-1">
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-sm text-[#999]">No results</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showDestModal} animationType="slide" transparent>
        <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
          <View className="bg-white rounded-t-[20px] h-[75%] pt-4">
            <View className="flex-row justify-between items-center px-4 pb-3 border-b border-[#EEE]">
              <Text className="text-lg font-semibold text-[#333]">Select</Text>
              <TouchableOpacity onPress={() => setShowDestModal(false)}>
                <Text className="text-[#007AFF]">Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={destInput}
              onChangeText={setDestInput}
              placeholder="Search for a place"
              className="mx-4 my-3 border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-base text-[#333]"
            />

            <FlatList
              data={destPredictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex-row items-start px-4 py-3 border-b border-[#F5F5F5]">
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-[#333]">
                      {item.main_text}
                    </Text>
                    <Text className="text-xs text-[#999] mt-1">
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-sm text-[#999]">No results</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Loading indicator */}
      {loading && (
        <View className="absolute inset-0 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}
