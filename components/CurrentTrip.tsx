import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { Checkbox } from "expo-checkbox";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Dialog from "react-native-dialog";
import Toast from "react-native-toast-message";
import Loading from "./Loading";
import ProfileImage from "./ProfileImage";

export default function CurrentTrip() {
  const router = useRouter();

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

  const checklist = useQuery(
    api.checklists.getByTrip,
    trip ? { tripId: trip._id } : "skip"
  );

  const [localChecklist, setLocalChecklist] = useState(checklist);
  const updateChecklistMutation = useMutation(
    api.checklists.updateChecklistItems
  );

  useEffect(() => {
    setLocalChecklist(checklist);
  }, [checklist]);

  // Function to handle checkbox changes
  const handleCheckboxChange = (index: number, newValue: boolean) => {
    if (!localChecklist) return;
    const updatedChecklist = [...localChecklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed: newValue,
    };
    setLocalChecklist(updatedChecklist);

    // Update the database with the new checklist items
    if (trip) {
      updateChecklistMutation({
        tripId: trip._id,
        items: updatedChecklist,
      });
    }
  };
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

  // dialog to add items to checklist
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState("");
  const [body, setBody] = useState("");

  const handleExit = () => {
    setVisible(false);
    setItem("");
    setBody("");
  };

  const addItem = useMutation(api.checklists.addItem);

  const handleAddItem = async () => {
    if (item.length >= 2) {
      // check if user inputed

      const success = await addItem({
        tripId: trip!._id,
        item: item,
      });

      if (!success.success) {
        setBody(success.message);
      } else setBody(success.message);

      setItem("");
    }
  };

  // Remove items from checklist
  const [itemModal, setItemModal] = useState(false);

  const deleteItem = useMutation(api.checklists.deleteItem);
  const handleRemoveItem = async (item: string) => {
    const success = await deleteItem({
      tripId: trip!._id,
      itemName: item,
    });

    console.log(success);
  };

  // leave trip
  const leaveTrip = useMutation(api.trips.leaveTrip);
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

  const handleLocationPress = (id: Id<"locations">) => {
    router.push({
      pathname: "/locationDetails",
      params: { locationId: id },
    });
  };

  if (users === undefined || checklist === undefined) {
    return <Loading />;
  }

  return (
    <View className="flex-1">
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
                <Text className="text-lg font-light text-center">
                  {trip?.description}
                </Text>
              ) : (
                <></>
              )}
            </View>

            <View className="w-full flex flex-col gap-5">
              <View className="flex flex-row items-center justify-start gap-3">
                <FontAwesome6 name="location-dot" size={24} color="black" />
                <Text className=" font-semibold text-2xl">
                  {trip?.location?.name}
                </Text>
              </View>
              {trip?.location?.description ? (
                <Text className="text-lg font-light text-center">
                  {trip?.location.description}
                </Text>
              ) : (
                <></>
              )}
              {trip?.isCustom ? (
                <></>
              ) : (
                // preset location
                <TouchableOpacity
                  onPress={() =>
                    handleLocationPress(trip!.locationId as Id<"locations">)
                  }
                  className="w-full rounded-lg bg-[#0D7377] p-5 my-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    See Location Details
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
                    <Text className="text-lg font-semibold">
                      {user.username}
                    </Text>
                    <Image
                      src={user.photoUrl as string}
                      className="w-16 h-16 rounded-full"
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleAdd}
                className="w-full rounded-lg bg-[#0D7377] p-5 my-10"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Add Members
                </Text>
              </TouchableOpacity>
            </View>

            <View className="w-full flex flex-col gap-5">
              <Text className="text-center font-semibold text-2xl">
                Checklist
              </Text>

              <View className="w-full flex flex-col items-center justify-center gap-5">
                {localChecklist?.map((item, index) => (
                  <View
                    key={index}
                    className="w-full flex flex-row justify-between items-center border-b border-slate-600 py-5"
                  >
                    <Text className="text-lg font-semibold">{item.name}</Text>
                    <Checkbox
                      value={item.completed}
                      color={"#0D7377"}
                      className="p-3"
                      onValueChange={(newValue) =>
                        handleCheckboxChange(index, newValue)
                      }
                    />
                  </View>
                ))}
              </View>

              {checklist!.length > 0 ? (
                <View className="w-full flex flex-row items-center justify-center gap-5">
                  <TouchableOpacity
                    onPress={() => setItemModal(true)}
                    className="flex-1 rounded-lg bg-red-600 p-5 my-10"
                  >
                    <Text className="text-white font-bold text-xl text-center">
                      Remove Items
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setVisible(true)}
                    className="flex-1 rounded-lg bg-[#0D7377] p-5 my-10"
                  >
                    <Text className="text-white font-bold text-xl text-center">
                      Add Items
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setVisible(true)}
                  className="w-full rounded-lg bg-[#0D7377] p-5 my-10"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Add Items
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Buttons */}
          <View className="w-full flex flex-col items-center justify-center gap-5 mt-10">
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

        {/* Remove items modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={itemModal}
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
                <Text className="font-semibold text-lg">Remove Items</Text>
                <TouchableOpacity onPress={() => setItemModal(false)}>
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
                  {checklist!.length > 0 ? (
                    checklist?.map((item, index) => (
                      <View key={index}>
                        <View className="w-full flex flex-row justify-between items-center border-b border-slate-600 pb-2">
                          <View className="flex flex-row items-center justify-center gap-5">
                            <Text className="text-lg font-semibold">
                              {item.name}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveItem(item.name)}
                            className=" rounded-lg bg-red-600 p-3 px-5"
                          >
                            <FontAwesome6
                              name="trash"
                              size={30}
                              color="white"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text>There are no items</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                              <ProfileImage src={user.photoUrl as string} />
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

        {/** Dialog box create */}
        <Dialog.Container visible={visible}>
          <Dialog.Title>Add item to checklist</Dialog.Title>
          <Dialog.Description> {body} </Dialog.Description>
          <Dialog.Input onChangeText={setItem} value={item} />
          <Dialog.Button label="Exit" onPress={handleExit} />
          <Dialog.Button label="Add" onPress={handleAddItem} />
        </Dialog.Container>
      </ScrollView>
      <Toast />
    </View>
  );
}
