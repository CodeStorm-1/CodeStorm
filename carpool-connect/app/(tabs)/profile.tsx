import { useSignupStore } from "@/store/signup-store";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth-store";

export default function Profile() {
  const { top, bottom } = useSafeAreaInsets();
  const username = useSignupStore((state) => state.name);
  const email = useSignupStore((state) => state.email);
  const phone = useSignupStore((state) => state.phone);
  const clear = useAuthStore((state) => state.clear);

  const profileImage = "https://picsum.photos/200";

  const handleLogout = () => {
    clear();
  };

  return (
    <View className="flex-1 bg-black">
      {/* Deep Gradient Header */}
      <LinearGradient
        colors={["#0f172a", "#020617"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
        style={{ paddingTop: top + 20, paddingBottom: 100 }}
        className="absolute inset-0"
      />

      {/* Scrollable Content */}
      <View className="flex-1 px-6" style={{ paddingTop: top + 60 }}>
        {/* Avatar + Name */}
        <View className="items-center">
          <View className="relative">
            <View
              className="w-36 h-36 rounded-full overflow-hidden border-4 border-zinc-800"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.6,
                shadowRadius: 24,
                elevation: 30,
              }}
            >
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            </View>

            <TouchableOpacity className="absolute -bottom-2 -right-2 bg-sky-500 p-3.5 rounded-full shadow-2xl">
              <Feather name="edit-2" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-3xl font-bold mt-8 tracking-tight">
            {username || "Guest User"}
          </Text>
          <Text className="text-zinc-400 text-sm mt-1">
            @{username?.toLowerCase().replace(/\s/g, "") || "user"}
          </Text>
        </View>

        {/* Info Cards */}
        <View className="mt-12 space-y-4 gap-4">
          <View className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl px-6 py-5 border border-zinc-800">
            <View className="flex-row items-center">
              <Feather name="mail" size={20} color="#94a3b8" />
              <View className="ml-4 flex-1">
                <Text className="text-slate-500 text-xs uppercase tracking-wider font-medium">
                  Email
                </Text>
                <Text className="text-white text-base mt-1 font-medium">
                  {email || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl px-6 py-5 border border-zinc-800">
            <View className="flex-row items-center">
              <Feather name="phone" size={20} color="#94a3b8" />
              <View className="ml-4 flex-1">
                <Text className="text-slate-500 text-xs uppercase tracking-wider font-medium">
                  Phone
                </Text>
                <Text className="text-white text-base mt-1 font-medium">
                  {phone || "Not provided"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Extra space so content isn't hidden behind bottom buttons */}
        <View className="h-32" />
      </View>

      {/* Fixed Bottom Action Buttons */}
      <View
        className="absolute left-0 right-0 px-6"
        style={{ bottom: bottom + 20 }} // respects iPhone notch
      >
        <View className="space-y-3 gap-4">
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-zinc-900/90 backdrop-blur-2xl rounded-2xl px-6 py-5 flex-row items-center border border-zinc-800 shadow-2xl"
          >
            <Feather name="lock" size={24} color="#a78bfa" />
            <Text className="text-white font-semibold ml-4 flex-1 text-base">
              Change Password
            </Text>
            <Feather name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="bg-red-900/30 backdrop-blur-2xl rounded-2xl px-6 py-5 flex-row items-center border border-red-800/50 shadow-2xl"
          >
            <MaterialIcons name="logout" size={24} color="#fca5a5" />
            <Text className="text-red-400 font-semibold ml-4 flex-1 text-base">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
