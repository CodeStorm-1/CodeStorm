// app/auth/email.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Mail } from "lucide-react-native";
import { getEmail } from "@/app/config/api";
import { useSignupStore } from "@/store/signup-store";
import Toast from "react-native-toast-message";

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const setField = useSignupStore((state) => state.setField);

  const handleNext = async () => {
    if (!email.trim())
      return Toast.show({
        type: "error",
        text1: "Empty field",
        text2: "Please enter your email",
      });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email",
      });

    console.log(email);

    const resp = await getEmail(email);

    console.log(resp);

    if (resp.error === "User not found") {
      setField("email", email);
      router.push("/(auth)/signup/passwordPage");
    } else {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        // @ts-ignore
        text2: "Found an account with that email.",
      });
      router.push("/(auth)/login-email/emailPage");
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
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center mb-8">
              <Mail size={40} color="#3B82F6" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              What's your email?
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center">
              We'll use this to set up your account
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
              className="w-full bg-blue-600 py-4 rounded-2xl shadow-lg active:opacity-90"
              activeOpacity={0.9}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("./signin")}>
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
