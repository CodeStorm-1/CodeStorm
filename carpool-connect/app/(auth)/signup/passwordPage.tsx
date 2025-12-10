// app/auth/password.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { useSignupStore } from "@/store/signup-store";
import Toast from "react-native-toast-message";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setField = useSignupStore((state) => state.setField);

  const handleContinue = () => {
    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty field",
        text2: "Please enter your password",
      });
      return;
    } /// ==> this
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }
    setField("password", password);
    // Continue to next step (e.g., phone, name, etc.)
    router.push("/(auth)/signup/phonePage"); // or wherever you want
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white dark:bg-gray-950 justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-16 left-8"
        >
          <Text className="text-blue-600 dark:text-blue-400 text-lg">
            ← Back
          </Text>
        </TouchableOpacity>

        <View className="space-y-8">
          {/* Icon + Title */}
          <View className="items-center">
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center mb-8">
              <Lock size={40} color="#3B82F6" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Create a password
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center px-4">
              Use at least 6 characters. Make it strong and unique.
            </Text>
          </View>

          {/* Password Input with Toggle */}
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full px-5 py-4 pr-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white text-lg my-8"
              placeholderTextColor="#9CA3AF"
            />

            {/* Show/Hide Toggle */}
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff size={24} color="#6B7280" />
              ) : (
                <Eye size={24} color="#6B7280" />
              )}
            </Pressable>
          </View>

          {/* Password Strength Indicator (Optional Future Enhancement) */}
          {password.length > 0 && password.length < 6 && (
            <Text className="text-red-500 text-sm text-center">
              Password too short (minimum 6 characters)
            </Text>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-blue-600 py-4 rounded-2xl shadow-lg active:opacity-90"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup/emailPage")}
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
