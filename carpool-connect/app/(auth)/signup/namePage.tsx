// app/auth/name.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { User, ArrowLeft } from "lucide-react-native";
import { useSignupStore } from "@/store/signup-store";
import { signup } from "@/app/config/api";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/store/auth-store";

export default function NamePage() {
  const [name, setName] = useState("");
  const setField = useSignupStore((state) => state.setField);
  const email = useSignupStore((state) => state.email);
  const password = useSignupStore((state) => state.password);
  const phone = useSignupStore((state) => state.phone);
  const setToken = useAuthStore((state) => state.setToken);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your full name");
      return;
    }

    if (name.length < 3) {
      Alert.alert("Invalid Name", "Name must be at least 3 characters long");
      return;
    }

    if (name.length > 50) {
      Alert.alert("Invalid Name", "Name must be less than 50 characters long");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      Alert.alert("Invalid Name", "Name can only contain letters and spaces");
      return;
    }

    if (name && email && password && phone) {
      const resp = await signup(name, phone, email, password);

      if (resp.error) {
        Toast.show({
          type: "error",
          text1: "Sign Up Failed",
          // @ts-ignore
          text2: resp.error,
        });
        return;
      }

      setToken(resp.token);
      setField("name", name);
      router.push("/(tabs)/profile"); // or next step
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white dark:bg-gray-950 justify-center px-8">
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

        <View className="space-y-10 items-center">
          {/* Icon */}
          <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center">
            <User size={48} color="#3B82F6" />
          </View>

          {/* Title & Subtitle */}
          <View className="items-center space-y-3">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center my-2">
              What's your name?
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-6">
              Enter your full name so we can personalize your experience.
            </Text>
          </View>

          {/* Name Input */}
          <View className="w-full my-6">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              className="w-full h-14 px-4 text-lg rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="w-full bg-blue-600 py-4 rounded-2xl shadow-lg active:opacity-90"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login-email/emailPage")}
            >
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
