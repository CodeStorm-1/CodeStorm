import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

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
  const [source, setSource] = useState<
    (LocationCoords & { address: string }) | null
  >(null);
  const [destination, setDestination] = useState<
    (LocationCoords & { address: string }) | null
  >(null);
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

  // Fetch place predictions from Google Places Autocomplete
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

  // Get place details (lat/lng) from place_id
  const getPlaceDetails = async (placeId: string, isSource: boolean) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&fields=geometry,formatted_address,name`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        const result = data.result;
        const coords = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };

        if (isSource) {
          setSource(coords);
          setSourceInput(result.formatted_address);
          setSourcePredictions([]);
          setShowSourceModal(false);
        } else {
          setDestination(coords);
          setDestInput(result.formatted_address);
          setDestPredictions([]);
          setShowDestModal(false);
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert("Error", "Failed to fetch location details");
    }
  };

  // Fetch routes between source and destination
  const fetchRoutes = async () => {
    if (!source || !destination) {
      Alert.alert("Error", "Please select both source and destination");
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

    const minLat = Math.min(source.latitude, destination.latitude);
    const maxLat = Math.max(source.latitude, destination.latitude);
    const minLng = Math.min(source.longitude, destination.longitude);
    const maxLng = Math.max(source.longitude, destination.longitude);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat + 0.05,
      longitudeDelta: maxLng - minLng + 0.05,
    };
  };

  const mapRegion = getMapRegion();

  return (
    <View style={styles.container}>
      {/* Map View */}
      {mapRegion ? (
        <MapView style={styles.map} initialRegion={mapRegion}>
          {source && (
            <Marker
              coordinate={{
                latitude: source.latitude,
                longitude: source.longitude,
              }}
              title="Pickup"
              pinColor="green"
            />
          )}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.latitude,
                longitude: destination.longitude,
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
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Select source & destination to see map
          </Text>
        </View>
      )}

      {/* Bottom Form */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Source Input */}
        <View style={styles.section}>
          <Text style={styles.label}>📍 Pickup Location</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowSourceModal(true)}
          >
            <Text style={styles.inputButtonText}>
              {sourceInput || "Select pickup location"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#007AFF" />
          </TouchableOpacity>
          {source && <Text style={styles.selectedText}>{source.address}</Text>}
        </View>

        {/* Destination Input */}
        <View style={styles.section}>
          <Text style={styles.label}>🎯 Drop Location</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowDestModal(true)}
          >
            <Text style={styles.inputButtonText}>
              {destInput || "Select drop location"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#007AFF" />
          </TouchableOpacity>
          {destination && (
            <Text style={styles.selectedText}>{destination.address}</Text>
          )}
        </View>

        {/* Find Routes Button */}
        {source && destination && (
          <TouchableOpacity
            style={styles.findRoutesButton}
            onPress={fetchRoutes}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.findRoutesButtonText}>🗺️ Find Routes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Routes Display */}
        {routes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>
              Available Routes (Sorted by fastest)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.routesList}
            >
              {routes.map((route, index) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeCard,
                    selectedRoute?.id === route.id && styles.routeCardSelected,
                  ]}
                  onPress={() => setSelectedRoute(route)}
                >
                  <View style={styles.routeCardContent}>
                    <Text style={styles.routeNumber}>Route {index + 1}</Text>
                    <Text style={styles.routeTime}>{route.duration}</Text>
                    <Text style={styles.routeDistance}>{route.distance}</Text>
                  </View>
                  {selectedRoute?.id === route.id && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark-circle-sharp"
                        size={28}
                        color="#34C759"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Route Info */}
        {selectedRoute && (
          <View style={styles.selectedRouteInfo}>
            <Text style={styles.selectedRouteTitle}>✓ Route Selected</Text>
            <View style={styles.routeInfoRow}>
              <Ionicons name="time" size={18} color="#007AFF" />
              <Text style={styles.routeInfoText}>{selectedRoute.duration}</Text>
            </View>
            <View style={styles.routeInfoRow}>
              <Ionicons name="navigate" size={18} color="#007AFF" />
              <Text style={styles.routeInfoText}>{selectedRoute.distance}</Text>
            </View>
          </View>
        )}

        {/* Continue Button */}
        {selectedRoute && (
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>
              Continue to Add Details
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Source Modal */}
      <Modal visible={showSourceModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Pickup Location</Text>
              <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor="#999"
              value={sourceInput}
              onChangeText={(text) => {
                setSourceInput(text);
                fetchPlacePredictions(text, true);
              }}
            />

            {sourcePredictions.length > 0 ? (
              <FlatList
                data={sourcePredictions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.predictionItem}
                    onPress={() => getPlaceDetails(item.place_id, true)}
                  >
                    <Ionicons name="location" size={18} color="#007AFF" />
                    <View style={styles.predictionText}>
                      <Text style={styles.predictionMain}>
                        {item.main_text}
                      </Text>
                      <Text style={styles.predictionSub}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Type to search locations
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Destination Modal */}
      <Modal visible={showDestModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Drop Location</Text>
              <TouchableOpacity onPress={() => setShowDestModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor="#999"
              value={destInput}
              onChangeText={(text) => {
                setDestInput(text);
                fetchPlacePredictions(text, false);
              }}
            />

            {destPredictions.length > 0 ? (
              <FlatList
                data={destPredictions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.predictionItem}
                    onPress={() => getPlaceDetails(item.place_id, false)}
                  >
                    <Ionicons name="location" size={18} color="#007AFF" />
                    <View style={styles.predictionText}>
                      <Text style={styles.predictionMain}>
                        {item.main_text}
                      </Text>
                      <Text style={styles.predictionSub}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Type to search locations
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    height: "45%",
  },
  mapPlaceholder: {
    height: "45%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  inputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9F9F9",
  },
  inputButtonText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  selectedText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 6,
    fontWeight: "500",
  },
  findRoutesButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  findRoutesButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  routesList: {
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
  },
  routeCardSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  routeCardContent: {
    alignItems: "center",
  },
  routeNumber: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: "500",
  },
  routeTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  routeDistance: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  selectedRouteInfo: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  selectedRouteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 10,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#34C759",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  predictionText: {
    marginLeft: 12,
    flex: 1,
  },
  predictionMain: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  predictionSub: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
  },
});
