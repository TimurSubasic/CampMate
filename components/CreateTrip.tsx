import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateTrip({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [locationName, setLocationName] = useState<string | undefined>(
    undefined
  );

  const [checklistName, setChecklistName] = useState<string | undefined>(
    undefined
  );

  const tabBarHeight = useBottomTabBarHeight();

  // modals
  const [locationModal, setLocationModal] = useState(false);
  const [customModal, setCustomModal] = useState(false);
  const [checklistModal, setChecklistModal] = useState(false);

  // custom location ?
  const [isCustom, setIsCustom] = useState<boolean | undefined>(undefined);

  // custom location props
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  // check if all info is set
  const [hasName, setHasName] = useState(true);
  const [hasLocation, setHasLocation] = useState(true);
  const [hasChecklist, setHasChecklist] = useState(true);

  // search stuff
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Get 5 locations
  const locations = useQuery(api.locations.getAll);

  // Query locations based on search text
  const searchResults = useQuery(api.locations.searchByName, {
    searchText: debouncedSearch,
  });

  // Debounce search input to avoid too many queries
  const handleSearchChange = (text: string) => {
    setSearchText(text);

    // Debounce the search query
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  };

  // set pickedLocation
  const [pickedLocation, setPickedLocation] = useState("");

  const handleLocationPick = (id: string, name: string) => {
    setIsCustom(false);

    setPickedLocation(id);

    setLocationName(name);

    setLocationModal(false);

    setHasLocation(true);
  };

  const checklists = useQuery(api.preset_checklists.getAllChecklists);

  const [pickedChecklist, setPickedChecklist] = useState<
    Id<"preset_cheklists"> | undefined
  >(undefined);

  const handleCustomSave = () => {
    if (customName.length >= 2) {
      setCustomModal(false);

      setIsCustom(true);

      setLocationName(customName);

      setHasLocation(true);
    }
  };

  const handleNameInput = (text: string) => {
    setName(text);

    if (text.length >= 2) {
      setHasName(true);
    }
  };

  const createTrip = useMutation(api.trips.createTrip);
  const createCustomLocation = useMutation(
    api.custom_locations.createCustomLocation
  );

  const handleCreateTrip = async () => {
    if (
      name.length >= 2 &&
      isCustom !== undefined &&
      pickedChecklist !== undefined
    ) {
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
          checklistId: pickedChecklist,
        });
      } else {
        // find location user picked and create trip with that location id
        createTrip({
          name: name,
          description: description,
          locationId: pickedLocation,
          isCustom: isCustom,
          checklistId: pickedChecklist,
        });
      }
    }
    // if trip details not set
    else {
      if (name.length < 2) {
        setHasName(false);
      }

      if (isCustom === undefined) {
        setHasLocation(false);
      }

      if (pickedChecklist === undefined) {
        setHasChecklist(false);
      }
    }
  };

  const handleChecklistSave = (id: Id<"preset_cheklists">, name: string) => {
    setPickedChecklist(id);

    setHasChecklist(true);

    setChecklistName(name);

    setChecklistModal(false);
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
            {/* Name */}
            <View className="flex flex-row w-full items-start justify-between">
              <Text className="text-xl font-semibold">Trip Name</Text>

              {hasName ? (
                <View />
              ) : (
                <Text className="font-semibold text-red-600">Enter a name</Text>
              )}
            </View>

            <TextInput
              className="p-5 border border-slate-600 rounded-lg w-full "
              placeholder="Name"
              placeholderTextColor={"#475569"}
              onChangeText={(text) => handleNameInput(text)}
              defaultValue={name}
            />

            {/* Description */}
            <View className="flex flex-row w-full items-start justify-between mt-5">
              <Text className="text-xl font-semibold">Trip Description</Text>
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

            {/* Location */}
            <View className="flex flex-row w-full items-start justify-between mt-5">
              <Text className="text-xl font-semibold">Location</Text>
              {hasLocation ? (
                locationName === undefined ? (
                  <View />
                ) : (
                  <Text>{locationName}</Text>
                )
              ) : (
                <Text className="font-semibold text-red-600">
                  Pick a location
                </Text>
              )}
            </View>

            <View className="flex flex-row items-center justify-center gap-5">
              <TouchableOpacity
                onPress={() => setLocationModal(true)}
                className="flex-1 flex flex-row items-center justify-between p-5 bg-white rounded-lg shadow"
              >
                <Text className="font-semibold">Browse...</Text>
                <FontAwesome name="search" size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCustomModal(true)}
                className="flex-1 flex flex-row items-center justify-between p-5 bg-white rounded-lg shadow"
              >
                <Text className="font-semibold">Custom</Text>
                <FontAwesome name="edit" size={24} />
              </TouchableOpacity>
            </View>

            {/* Checklist */}
            {/* Description */}
            <View className="flex flex-row w-full items-start justify-between mt-5">
              <Text className="text-xl font-semibold">Cheklist</Text>
              {hasChecklist ? (
                checklistName === undefined ? (
                  <View />
                ) : (
                  <Text>{checklistName}</Text>
                )
              ) : (
                <Text className="font-semibold text-red-600">
                  Pick a Checklist
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setChecklistModal(true)}
              className="w-full flex flex-row items-center justify-between p-5 bg-white rounded-lg shadow"
            >
              <Text className="font-semibold">Pick...</Text>
              <Octicons name="checklist" size={24} />
            </TouchableOpacity>
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

            <View className="flex-1 items-center justify-between">
              <View className="flex flex-col w-full items-start justify-center gap-5 mt-5 mb-10">
                <View className="flex flex-row items-center justify-center h-16 border bg-gray-200/50 border-slate-600 rounded-3xl w-full">
                  <TextInput
                    className="p-5 flex-1 "
                    placeholder="Search"
                    placeholderTextColor={"#475569"}
                    onChangeText={(text) => handleSearchChange(text)}
                    defaultValue={searchText}
                  />

                  <FontAwesome
                    size={30}
                    name="search"
                    className="pr-5"
                    color={"#475569"}
                  />
                </View>

                {/* map locations */}

                {debouncedSearch.length === 0 ? (
                  /* map locations */
                  <FlatList
                    className="w-full h-full pt-5"
                    showsVerticalScrollIndicator={false}
                    data={locations}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                      <View className=" w-full mb-5">
                        <TouchableOpacity
                          onPress={() =>
                            handleLocationPick(item._id, item.name)
                          }
                          className="border bg-gray-200/80 border-slate-600 w-full p-5 rounded-lg "
                        >
                          <Text className="font-semibold text-lg">
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ) : /* map search result */

                searchResults?.length === 0 ? (
                  <View className="w-full items-center justify-center flex my-20">
                    <Text>No locations found</Text>
                  </View>
                ) : (
                  <FlatList
                    className="w-full h-full pt-5"
                    showsVerticalScrollIndicator={false}
                    data={searchResults}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                      <View className=" w-full mb-5">
                        <TouchableOpacity
                          onPress={() =>
                            handleLocationPick(item._id, item.name)
                          }
                          className="border bg-gray-200/80 border-slate-600 w-full p-5 rounded-lg "
                        >
                          <Text className="font-semibold text-lg">
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customModal}
        onRequestClose={() => {
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

      {/* Checklists modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checklistModal}
        onRequestClose={() => {
          setChecklistModal(false);
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
              <Text className="font-semibold text-lg">Choose Checklist</Text>
              <TouchableOpacity onPress={() => setChecklistModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
              {/* map the checklist */}
              <FlatList
                className="w-full pt-5 h-full"
                data={checklists}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleChecklistSave(item._id, item.name)}
                    className="w-full flex flex-row items-center justify-between border bg-gray-200/80 border-slate-600 p-5 rounded-lg mb-5"
                  >
                    <Text className="text-lg font-medium">{item.name}</Text>
                    <Octicons name="checklist" size={24} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
