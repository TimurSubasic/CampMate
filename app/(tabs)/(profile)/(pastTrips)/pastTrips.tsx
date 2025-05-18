import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PastTrips() {
  const router = useRouter();
  return (
    <View>
      <View className="flex flex-row items-center justify-between w-full p-5">
        <TouchableOpacity
          className="flex flex-row items-center justify-center gap-3"
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={24} color={"#0D7377"} />
          <Text className="text-lg text-[#0D7377] font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-5 my-10"></View>
      </ScrollView>
    </View>
  );
}
