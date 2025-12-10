// app/auth/otp.tsx
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
import { useState, useRef, useEffect } from "react";
import { Shield, ArrowLeft } from "lucide-react-native";
import { useSignupStore } from "@/store/signup-store";
import Toast from "react-native-toast-message";
import { verifyOTP } from "@/app/config/api";

export default function OTPPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const setField = useSignupStore((state) => state.setField);
  const phone = useSignupStore((state) => state.phone);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter a valid OTP",
      });
      return;
    }

    if (phone) {
      const response = await verifyOTP(phone, enteredCode);
      if (response.error === "Invalid OTP") {
        console.log(response);
        Toast.show({
          type: "error",
          text1: "Invalid OTP",
          text2: "Please enter a valid OTP",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: response.message,
        text2: "You are now signed up!",
      });
      setField("otp", enteredCode);
      router.replace("/(auth)/signup/namePage");
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleVerify();
    }
  }, [code]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white dark:bg-gray-950 justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-16 left-8 z-10"
        >
          <ArrowLeft size={28} color="#3B82F6" />
        </TouchableOpacity>

        <View className="space-y-10 items-center">
          {/* Icon */}
          <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center">
            <Shield size={48} color="#3B82F6" />
          </View>

          {/* Title & Subtitle */}
          <View className="items-center space-y-3">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center my-2">
              Verify your phone number
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-6">
              We sent a 6-digit code to{"\n"}
              <Text className="font-semibold text-gray-700 dark:text-gray-300">
                +91 8104382998
              </Text>
            </Text>
          </View>

          {/* OTP Inputs */}
          <View className="flex-row gap-3 my-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref: TextInput | null) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                className={`w-14 h-14 border-2 text-center text-2xl font-bold rounded-2xl
                    ${
                      digit
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    }
                    text-gray-900 dark:text-white`}
                placeholder="-"
                placeholderTextColor="#9CA3AF"
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Resend Code */}
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500 dark:text-gray-400">
              Didn't receive it?
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                Resend code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleVerify}
            className="w-full bg-blue-600 py-4 rounded-2xl shadow-lg active:opacity-90"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Verify & Continue
            </Text>
          </TouchableOpacity>

          {/* Sign In Link below button */}
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
