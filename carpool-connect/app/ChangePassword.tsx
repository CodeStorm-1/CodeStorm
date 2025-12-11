import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import StarryBackground from "@/components/StarryBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePassword() {
  const { top } = useSafeAreaInsets();
  const [oldPassVisible, setOldPassVisible] = useState(false);
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    // backend call here
  };

  return (
    <StarryBackground>
      <View className="flex-1 px-6" style={{ paddingTop: top + 20 }}>
        <Text className="text-white text-3xl font-bold mt-4">
          Change Password
        </Text>
        <Text className="text-zinc-400 mt-2">
          Keep your account secure by updating your password.
        </Text>

        {/* OLD PASSWORD */}
        <View className="mt-10 bg-zinc-900/70 rounded-2xl px-5 py-4 border border-zinc-800">
          <Text className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
            Old Password
          </Text>

          <View className="flex-row items-center">
            <TextInput
              className="flex-1 text-white text-base"
              secureTextEntry={!oldPassVisible}
              placeholder="Enter old password"
              placeholderTextColor="#64748b"
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity
              onPress={() => setOldPassVisible(!oldPassVisible)}
            >
              <Feather
                name={oldPassVisible ? "eye" : "eye-off"}
                size={22}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* NEW PASSWORD */}
        <View className="mt-5 bg-zinc-900/70 rounded-2xl px-5 py-4 border border-zinc-800">
          <Text className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
            New Password
          </Text>

          <View className="flex-row items-center">
            <TextInput
              className="flex-1 text-white text-base"
              secureTextEntry={!newPassVisible}
              placeholder="Enter new password"
              placeholderTextColor="#64748b"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setNewPassVisible(!newPassVisible)}
            >
              <Feather
                name={newPassVisible ? "eye" : "eye-off"}
                size={22}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* CONFIRM PASSWORD */}
        <View className="mt-5 bg-zinc-900/70 rounded-2xl px-5 py-4 border border-zinc-800">
          <Text className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
            Confirm New Password
          </Text>

          <View className="flex-row items-center">
            <TextInput
              className="flex-1 text-white text-base"
              secureTextEntry={!confirmPassVisible}
              placeholder="Re-enter new password"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setConfirmPassVisible(!confirmPassVisible)}
            >
              <Feather
                name={confirmPassVisible ? "eye" : "eye-off"}
                size={22}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleChangePassword}
          className="mt-10 bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-900/50"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">
            Update Password
          </Text>
        </TouchableOpacity>
      </View>
    </StarryBackground>
  );
}
