import React from "react";
import { ScrollView, Text } from "react-native";

export default function PastTrips() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1 bg-white p-5"
    >
      <Text>PastTrips</Text>
    </ScrollView>
  );
}
