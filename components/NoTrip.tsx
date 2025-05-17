import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useQuery } from "convex/react";
import { useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CreateTrip from "./CreateTrip";

const NoFamily = () => {
  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  const [code, setCode] = useState("");

  const [codeAttempt, setCodeAttempt] = useState(false);

  const handleCodeJoin = () => {
    // try to join trip then set code attempt to true
  };

  const [creatingTrip, setCreatingTrip] = useState(false);

  const segments = useSegments();

  useEffect(() => {
    if (codeAttempt) {
      setCodeAttempt(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  if (creatingTrip) {
    return <CreateTrip />;
  } else {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1">
          <View className="flex flex-col flex-1 w-full items-center justify-between p-5 my-5">
            <View className="flex flex-col w-full items-start justify-center gap-3">
              <Text className="text-xl font-semibold">Join via Code:</Text>
              <View className="flex flex-row gap-2 w-full">
                <TextInput
                  className="p-5 border border-slate-600 rounded-lg w-[65%] "
                  placeholder="Code"
                  placeholderTextColor={"#475569"}
                  onChangeText={(newText) => setCode(newText)}
                  defaultValue={code}
                />
                <TouchableOpacity
                  onPress={handleCodeJoin}
                  className="flex-1 rounded-lg bg-[#0D7377] p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
              {codeAttempt ? (
                <Text className="text-red-500 font-semibold text-md">
                  No trip found
                </Text>
              ) : (
                <></>
              )}
            </View>

            <View className="flex w-full items-center justify-center my-10">
              <FontAwesome6 size={160} name="campground" color={"#0D7377"} />
              <Text className="text-center text-slate-800 uppercase font-bold text-2xl my-5 ">
                You aren&apos;t in a trip
              </Text>
            </View>

            <View className="flex flex-col gap-5 w-full items-center justify-center">
              <TouchableOpacity
                onPress={() => setCreatingTrip(true)}
                className="w-full rounded-lg bg-[#0D7377] p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Create a Trip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
};

export default NoFamily;
