// app/auth/signin/email.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Mail } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { getEmail } from "@/app/config/api";
import { useEmailLoginStore } from "@/store/email-login-store";

export default function SignInEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const setField = useEmailLoginStore((state) => state.setField);

  const handleNext = async () => {
    // 1. Client-Side Validation
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email address.",
      });
    }
    const resp = await getEmail(email);

    if (resp.error === "User not found") {
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        // @ts-ignore
        text2: "Could not find an account with that email.",
      });
      return;
    }

    setField("email", email);
    setLoading(true);

    try {
      // 3. Save State and Navigate
      // Pass the email as a query parameter to the password page
      router.push("/(auth)/login-email/passwordPage");
    } catch (error) {
      console.error("Email Check Error:", error);
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        // @ts-ignore
        text2: error.message || "Could not find an account with that email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white dark:bg-gray-950 justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Main Content */}
        <View className="space-y-8">
          <View className="items-center">
            <View className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl items-center justify-center mb-8">
              <Mail size={40} color="#10B981" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              What's your email?
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center">
              Enter the email linked to your account
            </Text>
          </View>

          {/* Input + Button Container */}
          <View className="space-y-4 w-full">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white text-lg my-8"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              onPress={handleNext}
              disabled={loading}
              className={`w-full bg-blue-600 py-4 rounded-2xl shadow-lg ${
                loading ? "opacity-60" : "active:opacity-90"
              }`}
              activeOpacity={0.9}
            >
              <Text className="text-white text-center text-lg font-semibold flex-row items-center justify-center">
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  "Continue"
                )}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600 dark:text-gray-400">New user? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup/emailPage")}
            >
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
