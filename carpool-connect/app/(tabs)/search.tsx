import { router } from "expo-router";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons"; // Assuming you have expo-vector-icons installed
import StarryBackground from "@/components/StarryBackground";

export default function HomeScreen() {
  // Mock function for the search action
  const handleSearch = () => {
    // In a real app, you would navigate to the search results page
    console.log("Searching for rides...");
    // router.push("/search-results");

    // Keeping the original navigation for demonstration if needed
    // router.push("./(auth)/signup/emailPage");
  };

  return (
    <StarryBackground>
      {/* --- BlaBlaCar Header Style --- */}
      <Text className="text-3xl font-bold text-red-600 dark:text-red-500 mb-6">
        Carpool
      </Text>

      {/* --- BlaBlaCar Search Card --- */}
      <View className="bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700">
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Find your next ride
        </Text>

        {/* Departure Input */}
        <View className="flex-row items-center border-b border-gray-200 dark:border-zinc-600 py-3">
          <FontAwesome5 name="map-marker-alt" size={20} color="#EF4444" />
          <TextInput
            placeholder="Leaving from..."
            placeholderTextColor="#888"
            className="flex-1 ml-3 text-lg text-gray-800 dark:text-white"
          />
        </View>

        {/* Arrival Input */}
        <View className="flex-row items-center border-b border-gray-200 dark:border-zinc-600 py-3 mb-4">
          <TextInput
            placeholder="Going to..."
            placeholderTextColor="#888"
            className="flex-1 ml-3 text-lg text-gray-800 dark:text-white"
          />
        </View>

        {/* Date Input (Simplified) */}
        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 dark:border-zinc-600 py-3 mb-6">
          <View className="flex-row items-center">
            <AntDesign name="calendar" size={20} color="#888" />
            <Text className="ml-3 text-lg text-gray-600 dark:text-gray-300">
              Tomorrow, Dec 9
            </Text>
          </View>
          <AntDesign name="right" size={16} color="#888" />
        </TouchableOpacity>

        {/* Search Button (The main BlaBlaCar red/burgundy) */}
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-xl shadow-md"
          onPress={handleSearch}
        >
          <Text className="text-white text-center text-xl font-bold">
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Section Divider Example --- */}
      <View className="mt-8">
        <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Your recent searches
        </Text>
        {/* Placeholder for recent search cards */}
        <View className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-100 dark:border-zinc-700">
          <Text className="text-gray-600 dark:text-gray-400">
            No recent searches found.
          </Text>
        </View>
      </View>

      {/* Keeping the original link in a less prominent style for reference */}
      <TouchableOpacity
        className="mt-8 p-3"
        onPress={() => router.push("./(auth)/signup/emailPage")}
      >
        <Text className="text-blue-500 text-center text-sm underline">
          Go to original email page (For testing)
        </Text>
      </TouchableOpacity>
    </StarryBackground>
  );
}
