// app/search/results.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useSearchStore } from "@/store/search-store";

type Ride = {
  _id: string;
  driverId: string;
  name: string;
  phone: string;
  pickupInfo: { latitude: number; longitude: number };
  destInfo: { latitude: number; longitude: number };
  vehicle: string;
  seats: number;
  price: number;
  pricingModel: string;
  date: string;
  time: string;
  encodedPolyline?: string;
  distanceToDestinationKm: number;
  matchScore: number;
};

export default function SearchResultsPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const { source, destination, date } = useSearchStore();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!source || !destination || !date) {
      Alert.alert("Error", "Please provide source, destination, and date.");
      router.back();
      return;
    }

    // Call backend API to get nearby drivers
    const fetchRides = async () => {
      try {
        setLoading(true);
        console.log(source, destination, date);
        const res = await fetch("http://10.130.91.206:3000/api/rides/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: source.latitude,
            lng: source.longitude,
            radiusMeters: 5000,
            date: date.toISOString(),
          }),
        });

        const data: Ride[] = await res.json();
        console.log(data);
        setRides(data);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to fetch rides.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [source, destination, date]);

  const styles = getStyles(isDarkMode);

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType?.toLowerCase()) {
      case "car":
        return "car";
      case "bus":
        return "bus";
      case "bike":
        return "motorbike";
      default:
        return "car";
    }
  };

  const calculateTotalCost = (ride: Ride) => {
    if (ride.pricingModel === "per_km") {
      return (ride.price * 10).toFixed(2); // Example 10km
    }
    return ride.price.toFixed(2);
  };

  const getAddressFromCoords = (lat: number, lng: number) =>
    `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;

  const RideCard = ({ item }: { item: Ride }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => {
        setSelectedRide(item);
        setShowDetails(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.driverSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color="#FFB800"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.tripCount}>(245 trips)</Text>
            </View>
          </View>
        </View>

        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{item.matchScore}%</Text>
          <Text style={styles.matchLabel}>match</Text>
        </View>
      </View>

      <View style={styles.timeVehicleRow}>
        <View style={styles.timeSection}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color="#007AFF"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.timeLabel}>Pickup Time</Text>
            <Text style={styles.timeValue}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.vehicleSection}>
          <MaterialCommunityIcons
            name={getVehicleIcon(item.vehicle)}
            size={20}
            color="#007AFF"
          />
          <Text style={styles.vehicleText}>{item.vehicle}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <MaterialCommunityIcons
            name="circle"
            size={12}
            color="#34C759"
            style={{ marginRight: 10 }}
          />
          <View style={styles.routeTextContainer}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {getAddressFromCoords(
                item.pickupInfo.latitude,
                item.pickupInfo.longitude
              )}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <MaterialCommunityIcons
            name="map-marker"
            size={12}
            color="#FF3B30"
            style={{ marginRight: 10 }}
          />
          <View style={styles.routeTextContainer}>
            <Text style={styles.routeLabel}>Drop</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {getAddressFromCoords(
                item.destInfo.latitude,
                item.destInfo.longitude
              )}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.seatsContainer}>
          <MaterialCommunityIcons
            name="seat-individual-suite"
            size={18}
            color="#FF9500"
          />
          <Text style={styles.seatsText}>{item.seats} seats available</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>₹{calculateTotalCost(item)}</Text>
        </View>
      </View>

      {item.distanceToDestinationKm > 0 && (
        <View style={styles.extraInfo}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={14}
            color="#FF9500"
          />
          <Text style={styles.extraInfoText}>
            +{item.distanceToDestinationKm.toFixed(2)}km from your destination
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (showDetails && selectedRide) {
    return (
      <ScrollView style={styles.detailsContainer}>
        {/* Use the detailed view here (reuse your current DetailedRideView) */}
        <Text>Detailed Ride View for {selectedRide.name}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={isDarkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {rides.length} ride{rides.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={({ item }) => <RideCard item={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="inbox-outline"
            size={64}
            color={isDarkMode ? "#A0AEC0" : "#CCC"}
          />
          <Text style={styles.emptyText}>No rides found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search criteria
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back & Search Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F8F9FA",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? "#1A1A1A" : "#fff",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2D2D2D" : "#E0E0E0",
      marginTop: 12,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    countContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDarkMode ? "#1A1A1A" : "#fff",
    },
    countText: {
      fontSize: 14,
      color: isDarkMode ? "#A0AEC0" : "#666",
      fontWeight: "500",
    },
    listContent: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    rideCard: {
      backgroundColor: isDarkMode ? "#1A1A1A" : "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2D2D2D" : "#E0E0E0",
      elevation: 2,
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    driverSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#007AFF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatarText: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "700",
    },
    driverInfo: {
      flex: 1,
    },
    driverName: {
      fontSize: 15,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginBottom: 4,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    rating: {
      fontSize: 12,
      fontWeight: "600",
      color: isDarkMode ? "#CBD5E0" : "#666",
      marginLeft: 2,
    },
    tripCount: {
      fontSize: 11,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginLeft: 4,
    },
    matchBadge: {
      backgroundColor: "#34C759",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    matchBadgeText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    matchLabel: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
    },
    timeVehicleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2D2D2D" : "#F0F0F0",
    },
    timeSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    timeLabel: {
      fontSize: 11,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginBottom: 2,
    },
    timeValue: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    vehicleSection: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 16,
    },
    vehicleText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginLeft: 8,
    },
    routeContainer: {
      backgroundColor: isDarkMode ? "#2D2D2D" : "#F8F9FA",
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    routePoint: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    routeTextContainer: {
      flex: 1,
      marginLeft: 8,
    },
    routeLabel: {
      fontSize: 11,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginBottom: 2,
    },
    routeAddress: {
      fontSize: 13,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    routeLine: {
      height: 20,
      width: 1,
      backgroundColor: isDarkMode ? "#4A5568" : "#E0E0E0",
      marginLeft: 5.5,
      marginVertical: 4,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#2D2D2D" : "#F0F0F0",
    },
    seatsContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    seatsText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginLeft: 6,
    },
    priceContainer: {
      alignItems: "flex-end",
    },
    priceLabel: {
      fontSize: 11,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginBottom: 2,
    },
    priceValue: {
      fontSize: 18,
      fontWeight: "700",
      color: "#007AFF",
    },
    extraInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#2D2D2D" : "#FFF8E1",
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
    },
    extraInfoText: {
      fontSize: 12,
      color: isDarkMode ? "#FFB800" : "#FF9500",
      fontWeight: "500",
      marginLeft: 8,
      flex: 1,
    },

    // Details View Styles
    detailsContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F8F9FA",
      paddingHorizontal: 16,
    },
    closeButton: {
      alignSelf: "flex-end",
      padding: 12,
      marginTop: 12,
    },
    detailCard: {
      backgroundColor: isDarkMode ? "#1A1A1A" : "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2D2D2D" : "#E0E0E0",
    },
    detailTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginBottom: 12,
    },
    detailContent: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    largeAvatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#007AFF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    largeAvatarText: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "700",
    },
    detailDriverInfo: {
      flex: 1,
    },
    detailName: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginBottom: 6,
    },
    detailRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    detailRating: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#CBD5E0" : "#666",
      marginLeft: 4,
    },
    detailTripCount: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginLeft: 4,
    },
    callButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#007AFF",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      gap: 6,
    },
    callButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    detailIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#2D2D2D" : "#F0F0F0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    detailRowContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginBottom: 4,
      fontWeight: "500",
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    priceBreakdown: {
      backgroundColor: isDarkMode ? "#2D2D2D" : "#F8F9FA",
      borderRadius: 10,
      padding: 12,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    totalRow: {
      marginBottom: 0,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#4A5568" : "#E0E0E0",
    },
    priceRowLabel: {
      fontSize: 14,
      color: isDarkMode ? "#CBD5E0" : "#666",
    },
    priceRowValue: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "700",
      color: "#007AFF",
    },
    bookButton: {
      backgroundColor: "#007AFF",
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      marginBottom: 10,
      alignItems: "center",
    },
    bookButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDarkMode ? "#A0AEC0" : "#999",
      marginTop: 6,
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
  });
