import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react-native"; // npm i lucide-react-native
import { useSignupStore } from "@/store/signup-store";
import Toast from "react-native-toast-message";
import { getOTP, getPhone } from "@/app/config/api";

export default function PhoneNumberPage() {
  const [phone, setPhone] = useState("");
  const setField = useSignupStore((state) => state.setField);

  // Simple US/International phone validation (you can replace with libphonenumber)
  const isValidPhone = (value: string) => {
    // Allow +, spaces, dashes and numbers – must contain at least 7 digits
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned.length >= 7;
  };

  const handleNext = async () => {
    if (!phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty field",
        text2: "Please enter your phone number",
      });
      return;
    }
    if (!isValidPhone(phone)) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Please enter a valid phone number",
      });
      return;
    }

    const resp = await getPhone(phone);
    if (resp.error !== "User not found") {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        // @ts-ignore
        text2: "Found an account with that phone number.",
      });
      router.push("/(auth)/login-email/emailPage");
    }

    const otp = await getOTP(phone);
    if (otp.message !== "OTP sent") {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        // @ts-ignore
        text2: "Found an account with that phone number.",
      });
      router.push("/(auth)/login-email/emailPage");
    }
    Toast.show({
      type: "success",
      text1: "OTP sent",
      text2: "Please enter the OTP sent to your phone number",
    });
    setField("phone", phone);
    router.push("/(auth)/signup/otpPage");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white dark:bg-zinc-950 justify-center px-8">
        {/* Hide the default expo‑router header */}
        <Stack.Screen options={{ headerShown: false }} />

        {/* ← Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-16 left-8"
        >
          <Text className="text-blue-600 dark:text-blue-400 text-lg">
            ← Back
          </Text>
        </TouchableOpacity>

        {/* ------------------- Main Content ------------------- */}
        <View className="space-y-8">
          {/* Header & illustration */}
          <View className="items-center">
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center mb-8">
              <Phone size={40} color="#3B82F6" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              What's your phone number?
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center">
              We'll send a verification code to this number
            </Text>
          </View>

          <View className="space-y-4 w-full">
            <View className="relative my-8">
              {/* Optional Phone Icon on the far left */}
              <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Phone size={22} color="#6B7280" />
              </View>

              {/* +91 Prefix */}
              <View className="absolute left-12 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Text className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  +91
                </Text>
              </View>

              {/* Actual Input (starts after +91) */}
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                className={`
      w-full
      ${Platform.OS === "ios" ? "py-4" : "py-4"}
      pl-24 pr-5
      bg-gray-50 dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-2xl
      text-gray-900 dark:text-white
      text-lg
    `}
                placeholderTextColor="#9CA3AF"
              />
            </View>
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

          {/* Sign‑in link (same as email page) */}
          <View className="flex-row justify-center mt-8">
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
