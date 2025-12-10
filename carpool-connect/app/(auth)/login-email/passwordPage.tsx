// app/auth/signin/password.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Lock } from "lucide-react-native";
import Toast from "react-native-toast-message";

export default function SignInPasswordPage() {
  // Retrieve the email passed from the previous screen
  const { userEmail } = useLocalSearchParams<{ userEmail: string }>();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // 1. Simple Validation
    if (!password.trim()) {
      return Toast.show({
        type: "error",
        text1: "Missing password",
        text2: "Please enter your password.",
      });
    }

    setLoading(true);

    try {
      // 3. Handle Success
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "You are now logged in!",
      });

      // >>> MODIFICATION HERE <<<
      // Navigate to the Search tab within the main application tabs
      router.replace("/(tabs)/search");
    } catch (error) {
      // 4. Handle Errors (e.g., incorrect password)
      console.error("Login Error:", error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        // @ts-ignore
        text2: error.message || "The password you entered is incorrect.",
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
            <View className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-3xl items-center justify-center mb-8">
              <Lock size={40} color="#8B5CF6" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Enter your password
            </Text>
            {userEmail && (
              <Text className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center font-semibold">
                Account: **{userEmail}**
              </Text>
            )}
          </View>

          {/* Input + Button Container */}
          <View className="space-y-4 w-full">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry // Hides the input characters
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white text-lg my-8"
              placeholderTextColor="#9CA3AF"
            />

            {/* Forgot Password Link */}
            <TouchableOpacity className="self-end -mt-8">
              <Text className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
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
                  "Sign In"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
