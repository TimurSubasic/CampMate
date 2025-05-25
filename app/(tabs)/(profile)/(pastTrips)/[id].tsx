import LargeImageWithLoading from "@/components/LargeImage";
import Loading from "@/components/Loading";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useMutation, useQuery } from "convex/react";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Trip() {
  const { id } = useLocalSearchParams();

  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  const router = useRouter();

  const screenWidth = Dimensions.get("window").width - 40;

  const pastTripId = id as Id<"past_trips">;

  const trip = useQuery(api.past_trips.getTripWithLocation, {
    tripId: pastTripId,
  });

  const users = useQuery(api.users.getUsersWithPhotosByPastTripId, {
    pastTripId: pastTripId,
  });

  const photos = useQuery(api.past_trips.getPastTripPhotos, {
    pastTripId: pastTripId,
  });

  const deletePhoto = useMutation(api.past_trips.deletePhoto);

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const addPhoto = useMutation(api.past_trips.addPhoto);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    //not cancled
    if (!result.canceled) {
      const fileUri = result.assets[0].uri;

      try {
        const uploadUrl = await generateUploadUrl();

        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl as string,
          fileUri as string,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            mimeType: "image/jpeg",
          }
        );

        if (uploadResult.status !== 200) {
          console.log("Error uploading image");
          return;
        }

        const { storageId } = JSON.parse(uploadResult.body);

        await addPhoto({
          pastTripId: pastTripId,
          storageId: storageId,
        });
      } catch (error) {
        console.log("Erorr catch", error);
      }
    }
  };

  const leaveTrip = useMutation(api.past_trips.leaveTrip);
  const handleDelete = () => {
    leaveTrip({
      userId: fullUser!._id,
      tripId: id as Id<"past_trips">,
    });
    router.back();
  };

  const handleSeeDetails = (id: Id<"locations">) => {
    router.push({
      pathname: "/locationDetails",
      params: { locationId: id },
    });
  };

  const downloadImage = async (imageUrl: string) => {
    // Request permission to access media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Cannot save image without permission");
      return;
    }

    Toast.show({
      type: "info",
      text1: "Image downloading!",
      text1Style: {
        fontSize: 18,
      },
      position: "top",
      visibilityTime: 2500,
    });

    try {
      // Step 1: Download to local cache directory
      const fileUri = FileSystem.cacheDirectory + "downloaded-image.jpg";

      const downloadedFile = await FileSystem.downloadAsync(imageUrl, fileUri);

      // Step 2: Save to gallery
      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false); // saves in 'Download' album

      Toast.show({
        type: "success",
        text1: "Image saved!",
        text2: "Find it in your gallery!",
        text1Style: {
          fontSize: 18,
        },
        text2Style: {
          fontSize: 16,
        },
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error accured",
        text2: "Try again later!",
        text1Style: {
          fontSize: 18,
        },
        text2Style: {
          fontSize: 16,
        },
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  if (users === undefined) {
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
        <View className="p-5 flex-1 items-center justify-between">
          <View className="flex flex-col items-center justify-center gap-10 w-full">
            {/* Trip info */}
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

            {/* Location */}
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
                    handleSeeDetails(trip!.locationId as Id<"locations">)
                  }
                  className="w-full rounded-lg bg-[#0D7377] p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    See details
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Members */}
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
            </View>

            {/* Photos */}
            {photos?.length === 0 ? (
              <View>
                <Text>You have no photos.</Text>
              </View>
            ) : (
              <View>
                <Text className="text-center font-semibold text-2xl mb-10">
                  Photos
                </Text>

                {/* photos */}
                <View className="flex w-full flex-col items-center justify-center gap-2">
                  <FlatList
                    scrollEnabled={false} // already in ScrollView
                    data={photos}
                    keyExtractor={(item) => item.storageId.toString()}
                    renderItem={({ item }) => (
                      <View className="my-2">
                        <LargeImageWithLoading src={item.url as string} />
                        <View
                          style={{ width: screenWidth }}
                          className="flex flex-row items-center justify-center"
                        >
                          <TouchableOpacity
                            onPress={() => downloadImage(item.url as string)}
                            className="bg-[#0D7377] flex-1 rounded-bl-lg flex-row items-center justify-between p-3"
                          >
                            <Text className="font-bold text-white text-lg">
                              Save
                            </Text>
                            <FontAwesome
                              name="download"
                              size={30}
                              color={"white"}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() =>
                              deletePhoto({
                                storageId: item.storageId as Id<"_storage">,
                                pastTripId: pastTripId,
                              })
                            }
                            className="bg-red-600 flex-1 rounded-br-lg flex-row items-center justify-between p-3"
                          >
                            <Text className="font-bold text-white text-lg">
                              Delete
                            </Text>
                            <FontAwesome
                              name="trash"
                              size={30}
                              color={"white"}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity
              onPress={pickImage}
              className="w-full rounded-lg bg-[#0D7377] p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Add Photo
              </Text>
            </TouchableOpacity>
          </View>
          {/* Delete trip */}
          <View className="w-full">
            <View className="h-3 w-full rounded-lg bg-red-600 my-5" />
            <TouchableOpacity
              onPress={handleDelete}
              className="w-full rounded-lg bg-red-600 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Delete Trip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
}
