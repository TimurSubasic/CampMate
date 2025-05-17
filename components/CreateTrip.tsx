import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function CreateTrip() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-5">
        <Text>CreateTrip</Text>
      </View>
    </ScrollView>
  );
}
