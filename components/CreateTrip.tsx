import { api } from "@/convex/_generated/api";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation } from "convex/react";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateTrip({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState("");
  const [locationModal, setLocationModal] = useState(false);
  const [customModal, setCustomModal] = useState(false);

  const [description, setDescription] = useState("");

  const tabBarHeight = useBottomTabBarHeight();

  const [isCustom, setIsCustom] = useState<boolean | undefined>(undefined);

  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const handleCustomSave = () => {
    if (customName.length >= 2) {
      setCustomModal(false);

      setIsCustom(true);
    }
  };

  const createTrip = useMutation(api.trips.createTrip);
  const createCustomLocation = useMutation(
    api.custom_locations.createCustomLocation
  );

  const handleCreateTrip = async () => {
    if (name.length >= 2 && isCustom !== undefined) {
      console.log("creating...");
      if (isCustom) {
        const customLocation = await createCustomLocation({
          name: customName,
          description: customDescription,
        });

        //create the trip
        createTrip({
          name: name,
          description: description,
          locationId: customLocation,
          isCustom: isCustom,
        });
      } else {
        // find location user picked and create trip with that location id
      }
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-5 flex-1 my-5">
        {/* header with right side cancel button */}
        <View className="flex flex-row items-center justify-between">
          <View />
          <TouchableOpacity onPress={() => onCancel()}>
            <Text className="font-semibold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* main content */}
        <View className="flex-1 items-center justify-between">
          <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
            <Text className="text-xl font-semibold">Choose your trip name</Text>
            <TextInput
              className="p-5 border border-slate-600 rounded-lg w-full "
              placeholder="Name"
              placeholderTextColor={"#475569"}
              onChangeText={(text) => setName(text)}
              defaultValue={name}
            />

            <View className="flex flex-row w-full items-center justify-between mt-5">
              <Text className="text-xl font-semibold">
                Write your description
              </Text>
              <Text className="text-sm font-light">Optional</Text>
            </View>

            <TextInput
              className="p-5 border border-slate-600 rounded-lg w-full "
              numberOfLines={7}
              multiline={true}
              placeholder="Description"
              placeholderTextColor={"#475569"}
              onChangeText={(text) => setDescription(text)}
              defaultValue={description}
            />

            <Text className="text-xl font-semibold mt-5">Location</Text>
            <View className="flex flex-row items-center justify-center gap-5">
              <TouchableOpacity
                onPress={() => setLocationModal(true)}
                className="flex-1 flex flex-row items-center justify-between p-5 bg-white rounded-lg shadow"
              >
                <Text>Browse...</Text>
                <FontAwesome name="search" size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCustomModal(true)}
                className="flex-1 flex flex-row items-center justify-between p-5 bg-white rounded-lg shadow"
              >
                <Text>Custom</Text>
                <FontAwesome name="edit" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreateTrip}
            className="w-full rounded-lg bg-[#0D7377] p-5"
          >
            <Text className="text-white font-bold text-xl text-center">
              Create Trip
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* modals */}

      {/* Preset Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setLocationModal(false);
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
              <Text className="font-semibold text-lg">Browse Locations</Text>
              <TouchableOpacity onPress={() => setLocationModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
            ></ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setCustomModal(false);
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
              <Text className="font-semibold text-lg">Custom Location</Text>
              <TouchableOpacity onPress={() => setCustomModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View className="flex-1 items-center justify-between">
                <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
                  <Text className="text-xl font-semibold">Location Name</Text>
                  <TextInput
                    className="p-5 border border-slate-600 rounded-lg w-full "
                    placeholder="Name"
                    placeholderTextColor={"#475569"}
                    onChangeText={(text) => setCustomName(text)}
                    defaultValue={customName}
                  />

                  <View className="flex flex-row w-full items-center justify-between mt-5">
                    <Text className="text-xl font-semibold">Description</Text>
                    <Text className="text-sm font-light">Optional</Text>
                  </View>

                  <TextInput
                    className="p-5 border border-slate-600 rounded-lg w-full "
                    numberOfLines={7}
                    multiline={true}
                    placeholder="Description"
                    placeholderTextColor={"#475569"}
                    onChangeText={(text) => setCustomDescription(text)}
                    defaultValue={customDescription}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleCustomSave}
                  className="w-full rounded-lg bg-[#0D7377] p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
