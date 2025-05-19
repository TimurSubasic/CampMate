import Loading from "@/components/Loading";
import MidImageWithLoading from "@/components/MidImageWithLoading";
import { api } from "@/convex/_generated/api";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "convex/react";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  // search stuff
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Get 5 locations
  const locations = useQuery(api.locations.getFiveWithPhoto);

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

  if (locations === undefined) {
    return <Loading />;
  }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-5">
        {/* Search box */}
        <View className="flex flex-row items-center justify-center h-16 border border-slate-600 rounded-3xl w-full">
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

        <View className="w-full flex flex-col items-center justify-center gap-10 my-10">
          {debouncedSearch.length === 0 ? (
            locations?.map((location, index) => (
              <View key={index} className="w-full">
                <TouchableOpacity className="w-full h-52 flex flex-row items-start justify-start rounded-lg border border-slate-600">
                  <MidImageWithLoading src={location.imageUrl as string} />

                  <View className="p-5 flex-1">
                    <Text className="text-lg font-semibold">
                      {location.name}
                    </Text>
                    <Text>{location.description}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : searchResults?.length === 0 ? (
            <View className="w-full items-center justify-center flex my-20">
              <Text>No locations found</Text>
            </View>
          ) : (
            searchResults?.map((location, index) => (
              <View key={index} className="w-full">
                <TouchableOpacity className="w-full h-52 flex flex-row items-start justify-start rounded-lg border border-slate-600">
                  <MidImageWithLoading src={location.imageUrl as string} />

                  <View className="p-5 flex-1">
                    <Text className="text-lg font-semibold">
                      {location.name}
                    </Text>
                    <Text>{location.description}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
