import { Id } from "@/convex/_generated/dataModel";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text } from "react-native";

export default function Trip() {
  const { id } = useLocalSearchParams();

  const pastTripId = id as Id<"past_trips">;

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
