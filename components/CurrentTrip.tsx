import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Loading from "./Loading";

export default function CurrentTrip() {
  const tabBarHeight = useBottomTabBarHeight();

  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  const trip = useQuery(
    api.trips.getTripWithLocation,
    fullUser?.tripId ? { tripId: fullUser.tripId as Id<"trips"> } : "skip"
  );

  const users = useQuery(
    api.users.getUsersWithPhotosByTripId,
    trip ? { tripId: trip._id } : "skip"
  );

  // add members
  const handleAdd = async () => {
    await Clipboard.setStringAsync(trip?.joinCode as string);

    Toast.show({
      type: "info",
      text1: "Code Coppied!",
      text2: "Send it to your friends!",
      text1Style: {
        fontSize: 18,
      },
      text2Style: {
        fontSize: 16,
      },
      position: "top",
      visibilityTime: 3000,
    });
  };

  // leave trip
  const leaveTrip = useMutation(api.users.leaveTrip);
  const handleLeave = () => {
    leaveTrip({
      userId: fullUser?._id as Id<"users">,
      tripId: trip?._id as Id<"trips">,
    });
  };

  //kick members
  const [kickModal, setKickModal] = useState(false);

  const changeTripId = useMutation(api.users.changeTripId);

  const handleKick = (id: Id<"users">) => {
    changeTripId({
      id: id,
      tripId: undefined,
    });
  };

  // complete trip
  const completeTrip = useMutation(api.trips.completeTrip);

  const handleCompleteTrip = () => {
    completeTrip({
      tripId: trip!._id,
    });
  };

  if (users === undefined) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-5 my-10 flex-1 items-center justify-between">
        {/* Content */}
        <View className="flex flex-col items-center justify-center gap-10 w-full">
          <View className="w-full flex flex-col gap-5">
            <Text className="text-center font-semibold text-3xl">
              {trip?.name}
            </Text>
            {trip?.description ? (
              <Text className="text-lg font-light">
                Description: {trip?.description}
              </Text>
            ) : (
              <></>
            )}
          </View>

          <View className="w-full flex flex-col gap-5">
            <Text className=" font-semibold text-2xl">
              Location: {trip?.location?.name}
            </Text>
            {trip?.location?.description ? (
              <Text className="text-lg font-light mt-5">
                Description: {trip?.description}
              </Text>
            ) : (
              <></>
            )}
            {trip?.isCustom ? (
              <></>
            ) : (
              // preset location
              <TouchableOpacity
                // onPress={ handleSeeDetails }
                className="w-full rounded-lg bg-[#0D7377] p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  See details
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="w-full flex flex-col gap-5">
            <Text className="text-center font-semibold text-2xl">
              Trip Members
            </Text>

            <View className="w-full flex flex-col items-center justify-center gap-5">
              {users?.map((user, index) => (
                <View
                  key={index}
                  className="w-full flex flex-row justify-between items-center"
                >
                  <Text className="text-lg font-semibold">{user.username}</Text>
                  <Image
                    src={user.photoUrl as string}
                    className="w-16 h-16 rounded-full"
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="w-full flex flex-col items-center justify-center gap-5 mt-10">
          <TouchableOpacity
            onPress={handleAdd}
            className="w-full rounded-lg bg-[#0D7377] p-5"
          >
            <Text className="text-white font-bold text-xl text-center">
              Add Members
            </Text>
          </TouchableOpacity>
          <View className="h-3 w-full rounded-lg bg-red-600 mt-5" />
          <TouchableOpacity
            onPress={handleLeave}
            className="w-full rounded-lg bg-red-600 p-5"
          >
            <Text className="text-white font-bold text-xl text-center">
              Leave Trip
            </Text>
          </TouchableOpacity>
          {trip?.adminId === fullUser?._id ? (
            <TouchableOpacity
              onPress={() => setKickModal(true)}
              className="w-full rounded-lg bg-red-600 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Kick Member
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
          {trip?.adminId === fullUser?._id ? (
            <View className="w-full flex flex-col items-center justify-center gap-5">
              <View className="h-3 w-full rounded-lg bg-red-600 mb-5" />
              <TouchableOpacity
                onPress={handleCompleteTrip}
                className="w-full rounded-lg bg-[#F4A300] p-5 border-4 border-black "
              >
                <Text className="text-black font-bold text-xl text-center">
                  Complete Trip
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>

      {/* Modals */}

      {/* Kick members Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={kickModal}
        onRequestClose={() => {
          setKickModal(false);
        }}
      >
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View
          className="flex-1 flex items-center justify-center"
          style={{ marginBottom: tabBarHeight / 2 }}
        >
          <View className="w-[80%] h-[70%] -mt-[10%] bg-white rounded-xl p-5 ">
            <View className="flex flex-row items-center justify-between">
              <Text className="font-semibold text-lg">Kick Members</Text>
              <TouchableOpacity onPress={() => setKickModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex flex-col w-full items-center justify-center gap-10 my-10">
                {users.length > 1 ? (
                  users?.map((user, index) => (
                    <View key={index}>
                      {user._id !== trip?.adminId ? (
                        <View className="w-full flex flex-row justify-between items-center">
                          <View className="flex flex-row items-center justify-center gap-5">
                            <Image
                              src={user.photoUrl as string}
                              className="w-16 h-16 rounded-full"
                            />
                            <Text className="text-lg font-semibold">
                              {user.username}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleKick(user._id)}
                            className=" rounded-lg bg-red-600 p-5 px-8"
                          >
                            <Text className="text-white font-bold text-xl text-center">
                              Kick
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <></>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="text-2xl font-bold text-center">
                    You are the only member!
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast />
    </ScrollView>
  );
}
