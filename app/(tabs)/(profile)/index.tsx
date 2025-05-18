import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMutation, useQuery } from "convex/react";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const router = useRouter();

  const { signOut } = useAuth();

  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  const [text, setText] = useState("");

  const changeUsername = useMutation(api.users.changeUsername);

  const deletePreviusPhoto = useMutation(api.users.deletePreviusPhoto);

  const handleUsernameSave = () => {
    if (text.length >= 2) {
      changeUsername({
        id: fullUser!._id,
        username: text,
      });
      setText("");
    }
  };

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const changePhoto = useMutation(api.users.changePhoto);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    //not cancled
    if (!result.canceled) {
      const fileUri = result.assets[0].uri;

      try {
        const uploadUrl = await generateUploadUrl();
        console.log("Upload URL:", uploadUrl);

        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl as string,
          fileUri as string,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            mimeType: "image/jpeg",
          }
        );

        console.log("Upload Result:", uploadResult);

        if (uploadResult.status !== 200) {
          console.log("Error uploading image");
          return;
        }

        const { storageId } = JSON.parse(uploadResult.body);

        console.log("Storage ID:", storageId);

        const previusPhoto = fullUser?.photo as Id<"_storage">;

        if (previusPhoto !== "kg2f6gfmq2vvdbehah7bg1eh497g036z") {
          deletePreviusPhoto({
            storageId: previusPhoto,
          });
        }

        await changePhoto({
          id: fullUser!._id,
          photo: storageId,
        });
      } catch (error) {
        console.log("Erorr catch", error);
      }
    }
  };

  const imageUrl = useQuery(
    api.users.getImageUrl,
    fullUser?.photo
      ? {
          storageId: fullUser.photo as Id<"_storage">,
        }
      : "skip"
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 p-5">
        <View className="flex-row justify-between items-center my-10">
          <View className="flex-row items-center justify-between w-full">
            <View className="flex-col items-start justify-between">
              <Text className="text-lg font-semibold text-gray-800">
                {fullUser?.username}
              </Text>
              <Text className="text-sm text-gray-500">Welcome back</Text>
            </View>
            {imageUrl ? (
              <Image src={imageUrl} className="w-16 h-16 rounded-full" />
            ) : (
              <ActivityIndicator />
            )}
          </View>
        </View>

        {/* buttons */}
        <View className="flex-1 flex-col items-center justify-between w-full">
          <View className="flex gap-10 w-full">
            {/**change username box */}
            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-lg font-semibold text-gray-800">
                Change username:{" "}
              </Text>
              <View className="flex flex-row gap-2 w-full">
                <TextInput
                  className="p-5 border border-slate-600 rounded-lg w-[65%] "
                  placeholder="New username"
                  placeholderTextColor={"#475569"}
                  onChangeText={(newText) => setText(newText)}
                  defaultValue={text}
                />
                <TouchableOpacity
                  onPress={handleUsernameSave}
                  className="flex-1 rounded-lg bg-[#0D7377] p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="bg-white p-5 rounded-lg shadow flex-row items-center"
              onPress={() => pickImage()}
            >
              <FontAwesome
                name="camera"
                size={24}
                color="#0D7377"
                className="mr-4"
              />
              <Text className="text-lg font-semibold text-gray-800">
                Change Profile Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white p-5 rounded-lg shadow flex-row items-center"
              onPress={() =>
                router.push("/(tabs)/(profile)/(pastTrips)/pastTrips")
              }
            >
              <FontAwesome
                name="history"
                size={24}
                color="#0D7377"
                className="mr-4"
              />
              <Text className="text-lg font-semibold text-gray-800">
                Past Trips
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white p-5 rounded-lg shadow flex-row items-center">
              <FontAwesome
                name="bell"
                size={24}
                color="#0D7377"
                className="mr-4"
                onPress={() => {}} // add actual something
              />
              <Text className="text-lg font-semibold text-gray-800">
                Notifications // maybe
              </Text>
            </TouchableOpacity>
          </View>

          <View className="w-full my-10">
            <View className="h-3 w-full rounded-lg bg-red-600 mb-5" />
            <TouchableOpacity
              className="bg-white p-5 rounded-lg shadow flex-row items-center"
              onPress={() => signOut()}
            >
              <FontAwesome
                name="sign-out"
                size={24}
                color="#dc2626"
                className="mr-4"
              />
              <Text className="text-lg font-semibold text-gray-800">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
