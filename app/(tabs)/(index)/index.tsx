import Loading from "@/components/Loading";
import MidImageWithLoading from "@/components/MidImage";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  // width for cards
  const screenWidth = (Dimensions.get("window").width - 60) / 2;

  // search stuff
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Get 5 locations
  const locations = useQuery(api.locations.getWithPhoto);

  // Query locations based on search text
  const searchResults = useQuery(api.locations.searchByNameWithPhoto, {
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

  const handleLocationPress = (id: Id<"locations">) => {
    router.push({
      pathname: "/locationDetails",
      params: { locationId: id },
    });
  };

  if (locations === undefined) {
    return <Loading />;
  }
  return (
    <View className="p-5 mb-12">
      {/* Search box */}
      <View className="flex flex-row items-center justify-center h-16 border bg-gray-200/80 border-slate-600 rounded-3xl w-full mb-2">
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

      {/* locations */}

      {debouncedSearch.length === 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={locations}
          key={"grid"}
          keyExtractor={(location) => location._id.toString()}
          className="w-full h-full"
          numColumns={2}
          contentContainerStyle={{ padding: 0, columnGap: 10 }}
          renderItem={({ item }) => (
            <View
              style={{
                width: screenWidth,
              }}
              className="mr-5 my-5 bg-gray-200/80 rounded-lg border border-slate-600"
            >
              <TouchableOpacity
                onPress={() => handleLocationPress(item._id)}
                className="flex-1 flex items-center justify-start gap-5"
              >
                <MidImageWithLoading src={item.imageUrl as string} />

                <View className="p-5 w-52">
                  <Text className="text-lg font-semibold">{item.name}</Text>
                  <Text>{item.description}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : searchResults?.length === 0 ? (
        <View className="w-full items-center justify-center flex my-20">
          <Text>No locations found</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={searchResults}
          key={"search"}
          keyExtractor={(location) => location._id.toString()}
          className="w-full h-full"
          renderItem={({ item }) => (
            <View
              className="w-full my-5 bg-gray-200/80 rounded-lg border border-slate-600"
              style={{ height: screenWidth }}
            >
              <TouchableOpacity
                onPress={() => handleLocationPress(item._id)}
                className="w-full flex flex-row items-start justify-start"
              >
                <MidImageWithLoading src={item.imageUrl as string} />

                <View className="p-5 flex-1">
                  <Text className="text-lg font-semibold">{item.name}</Text>
                  <Text>{item.description}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
