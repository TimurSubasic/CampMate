import Loading from "@/components/Loading";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PastTrips() {
  const router = useRouter();
  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  const pastTrips = useQuery(
    api.past_trips.getTripsByUser,
    fullUser?._id ? { userId: fullUser._id } : "skip"
  );

  if (pastTrips === undefined) {
    return <Loading />;
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex flex-row items-center justify-between w-full p-5">
        <TouchableOpacity
          className="flex flex-row items-center justify-center gap-3"
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={24} color={"#0D7377"} />
          <Text className="text-lg text-[#0D7377] font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-5 ">
          {/* Check if user has trips */}
          {pastTrips.length === 0 ? (
            <View>
              <Text className="font-bold text-3xl text-center">
                You have 0 Past Trips!
              </Text>
            </View>
          ) : (
            // if user has trips
            <View className="flex flex-col items-center justify-center gap-10 w-full">
              {pastTrips.map((trip, index) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(profile)/(pastTrips)/[id]",
                      params: { id: trip._id },
                    })
                  }
                  key={index}
                  className="bg-white p-5 rounded-lg shadow flex-row items-center justify-between w-full"
                >
                  <Text className="text-lg font-semibold text-gray-800">
                    {trip.name}
                  </Text>
                  <FontAwesome6 size={30} name="campground" color={"#0D7377"} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
