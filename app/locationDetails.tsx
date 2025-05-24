import Rating from "@/components/Rating";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LocationDetails() {
  const { locationId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const locations = useQuery(api.locations.getAll);
  const location = locations?.find((loc) => loc._id === locationId);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [comment, setComment] = useState("");
  const [tempRating, setTempRating] = useState(0);

  // Get ratings for this location
  const ratings = useQuery(api.location_ratings.getRatingsByLocation, {
    locationId: locationId as string,
  });

  // Get user's rating for this location
  const userRating = useQuery(api.location_ratings.getUserRating, {
    locationId: locationId as string,
    userId: user?.id || "",
  });

  const rateLocation = useMutation(api.location_ratings.rateLocation);
  const deleteRating = useMutation(api.location_ratings.deleteRating);

  const handleRate = async (rating: number) => {
    setTempRating(rating);
  };

  const handlePostReview = async () => {
    if (!user?.id || tempRating === 0) return;
    
    await rateLocation({
      locationId: locationId as string,
      userId: user.id,
      rating: tempRating,
      comment: comment.trim() || undefined,
    });
    
    setComment("");
    setTempRating(0);
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!user?.id) return;
    await deleteRating({ ratingId });
  };

  // Get the image URL from Convex storage
  const imageUrl = useQuery(api.users.getImageUrl, {
    storageId: location?.photo as Id<"_storage">,
  });

  // Get animals for this location
  const animals = useQuery(api.location_animals.getAnimalsByLocation, {
    locationId: locationId as string,
  });

  if (!location) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0D7377" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: location.name,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#0D7377',
        }} 
      />
      <ScrollView className="flex-1 bg-white">
        <TouchableOpacity 
          className="absolute top-5 right-5 z-10 bg-white rounded-full p-2 shadow-md"
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#0D7377" />
        </TouchableOpacity>
        <View className="w-full h-[250px] bg-gray-100">
          {imageLoading && (
            <View className="absolute inset-0 justify-center items-center bg-gray-100">
              <ActivityIndicator size="large" color="#0D7377" />
            </View>
          )}
          {imageError ? (
            <View className="w-full h-[250px] justify-center items-center bg-gray-100">
              <Text className="text-gray-600 text-base">Failed to load image</Text>
            </View>
          ) : (
            <Image 
              source={{ uri: imageUrl || undefined }} 
              className="w-full h-[250px]"
              style={{ resizeMode: "cover" }}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </View>
        
        <View className="p-5">
          <Text className="text-2xl font-bold mb-2.5 text-gray-800">{location.name}</Text>
          <Text className="text-base leading-6 text-gray-600 mb-5">{location.description}</Text>
          
          {/* Rating Section */}
          <View className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="text-xl font-bold mb-4 text-gray-800">Rating</Text>
            <Rating 
              rating={location.averageRating || 0} 
              totalRatings={location.totalRatings}
              size="large"
            />
          </View>
          
          {/* Animals Section */}
          {animals && animals.length > 0 && (
            <View className="mb-5">
              <Text className="text-xl font-bold mb-4 text-gray-800">Wildlife</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-2.5"
              >
                {animals.map((animal) => (
                  <View key={animal._id} className="w-[300px] mr-4 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <View className="flex-row p-2.5">
                      <View className="w-20 h-20 rounded-lg overflow-hidden bg-white">
                        {!animal.photo ? (
                          <View className="w-full h-full justify-center items-center bg-gray-100">
                            <ActivityIndicator size="small" color="#0D7377" />
                          </View>
                        ) : (
                          <Image 
                            source={{ uri: animal.photo }} 
                            className="w-full h-full"
                            style={{ resizeMode: "cover" }}
                            onError={(e) => console.log('Error loading animal image:', e.nativeEvent.error)}
                          />
                        )}
                      </View>
                      <View className="flex-1 ml-3 justify-center">
                        <Text className="text-base font-bold text-gray-800 mb-1">{animal.name}</Text>
                        <Text className="text-sm text-gray-600 leading-[18px]" numberOfLines={3}>
                          {animal.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-sm text-gray-600 mb-1.5">
              Latitude: {location.latitude}
            </Text>
            <Text className="text-sm text-gray-600 mb-1.5">
              Longitude: {location.longitude}
            </Text>
          </View>

          {/* User Rating Section */}
          {user?.id && (
            <View className="mt-5 p-4 bg-gray-50 rounded-lg">
              <Text className="text-base font-semibold mb-2.5 text-gray-700">Your Rating</Text>
              <Rating 
                rating={userRating?.rating || tempRating}
                interactive={true}
                onRate={handleRate}
                size="large"
              />
              <TextInput
                className="mt-2.5 p-2.5 bg-white rounded-lg border border-gray-300 min-h-[80px]"
                style={{ textAlignVertical: "top" }}
                placeholder="Add a comment (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity 
                className={`mt-4 p-3 rounded-lg items-center ${tempRating === 0 ? 'bg-gray-300' : 'bg-[#0D7377]'}`}
                onPress={handlePostReview}
                disabled={tempRating === 0}
              >
                <Text className="text-white text-base font-semibold">Post Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ratings List */}
          {ratings && ratings.length > 0 && (
            <View className="mt-5 p-4 bg-gray-50 rounded-lg">
              <Text className="text-xl font-bold mb-4 text-gray-800">Comments and Ratings</Text>
              {ratings.map((rating) => (
                <View key={rating._id} className="mb-4 p-2.5 bg-white rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="font-semibold text-gray-800">{rating.username}</Text>
                    <View className="flex-row items-center gap-2.5">
                      <Rating rating={rating.rating} size="small" />
                      {rating.userId === user?.id && (
                        <TouchableOpacity 
                          className="p-1.5"
                          onPress={() => handleDeleteRating(rating._id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ff4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {rating.comment && (
                    <Text className="text-gray-600 text-sm leading-5">{rating.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
} 