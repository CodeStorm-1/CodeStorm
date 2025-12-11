// src/screens/BookedRidesScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { fetchAndGeocodeRides } from "@/app/config/api";
import { ProcessedRide } from "@/app/config/api"; // आपकी data processing फ़ाइल

const USER_ID = "1";

interface LocationInfo {
  latitude: number;
  longitude: number;
  _id?: string;
}
interface BackendRide {
  _id: string;
  pickupInfo: LocationInfo;
  destInfo: LocationInfo;
  encodedPolyline: string;
  vehicle: string;
  seats: number;
  date: string;
  price: number;
  status: "booked" | "completed" | "cancelled";
}

// --- Component to display a single Ride Card ---
interface RideCardProps {
  ride: ProcessedRide;
}

const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: ProcessedRide["status"]) => {
    switch (status) {
      case "booked":
        return { icon: "timer-sand", color: "#fcd34d", text: "text-amber-300" };
      case "completed":
        return {
          icon: "check-circle",
          color: "#34d399",
          text: "text-emerald-400",
        };
      case "cancelled":
        return { icon: "x-circle", color: "#f87171", text: "text-red-400" };
      default:
        return {
          icon: "help-circle",
          color: "#94a3b8",
          text: "text-slate-400",
        };
    }
  };

  const status = getStatusStyle(ride.status || "booked");

  // Extract primary location (first part before comma or full address if no comma)
  const getPrimaryLocation = (address: string) => {
    if (!address || address === "Address not available") return address;
    return address.split(",")[0].trim() || address;
  };

  return (
    <View className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl px-5 py-4 border border-zinc-800 space-y-3">
      {/* Details: Pickup and Drop - Primary Locations Only */}
      <View className="space-y-2">
        {/* Pickup */}
        <View className="flex-row items-center">
          <MaterialIcons name="my-location" size={18} color="#64748b" />
          <View className="ml-3 flex-1">
            <Text className="text-slate-500 text-xs uppercase tracking-wider">
              Pickup
            </Text>
            <Text className="text-white text-base font-medium">
              {getPrimaryLocation(ride.pickupAddress)}
            </Text>
          </View>
        </View>

        {/* Drop */}
        <View className="flex-row items-center pt-2">
          <Feather name="map-pin" size={18} color="#64748b" />
          <View className="ml-3 flex-1">
            <Text className="text-slate-500 text-xs uppercase tracking-wider">
              Drop
            </Text>
            <Text className="text-white text-base font-medium">
              {getPrimaryLocation(ride.dropAddress)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer: Date/Time and Vehicle Info */}
      <View className="pt-2 border-t border-zinc-700/50 flex-row justify-between items-center">
        <Text className="text-zinc-400 text-sm font-medium">
          {ride.date ? formatDate(ride.date) : "Date/Time Unavailable"}
        </Text>
        <Text className="text-zinc-400 text-sm font-medium">
          Vehicle: {ride.vehicle || "N/A"} (Seats: {ride.seats || 0})
        </Text>
      </View>

      {/* Example Action Button */}
      {ride.status === "booked" && (
        <TouchableOpacity className="mt-3 bg-red-900/30 rounded-lg p-2 items-center border border-red-800/50">
          <Text className="text-red-400 font-semibold text-sm">
            Cancel Ride
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// -------------------------------------------------------------------------
// Main Screen Component
// -------------------------------------------------------------------------

export default function BookedRidesScreen() {
  const { top } = useSafeAreaInsets();

  const [rides, setRides] = useState<ProcessedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = useCallback(async (userId: string) => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAndGeocodeRides();
      setRides(data);
    } catch (e: any) {
      console.error("Fetch error:", e.message);
      setError(e.message || "Failed to load trips. Please check connection.");
      setRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRides(USER_ID);
  }, [fetchRides]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides(USER_ID);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator size="large" color="#6ee7b7" className="mt-10" />
      );
    }

    if (error) {
      return (
        <View className="mt-10 items-center px-4">
          <MaterialIcons name="error-outline" size={40} color="#f87171" />
          <Text className="text-red-400 text-lg mt-2 font-semibold text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="mt-4 bg-zinc-800 rounded-lg p-3"
          >
            <Text className="text-zinc-300 font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (rides.length === 0) {
      return (
        <View className="mt-10 items-center">
          <Feather name="inbox" size={40} color="#94a3b8" />
          <Text className="text-zinc-300 text-lg mt-2 font-semibold">
            No Booked Rides Found
          </Text>
          <Text className="text-zinc-400 text-sm mt-1">
            You haven't booked any trips yet.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RideCard ride={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6ee7b7"
          />
        }
      />
    );
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

      {/* ---------- Main Content Area ---------- */}
      <View className="flex-1 px-6" style={{ paddingTop: top + 40 }}>
        {/* ----- Page Title ----- */}
        <View className="items-center mb-8">
          <Text className="text-white text-3xl font-bold tracking-tight">
            My Booked Trips
          </Text>
          <Text className="text-zinc-400 text-sm mt-1">
            Viewing {rides.length} trips
          </Text>
        </View>

        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
});
