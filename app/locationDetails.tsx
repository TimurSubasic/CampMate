import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LocationDetails() {
  const { locationId } = useLocalSearchParams();
  const router = useRouter();
  const locations = useQuery(api.locations.getAll);
  const location = locations?.find((loc) => loc._id === locationId);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
      <View style={styles.container}>
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
      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#0D7377" />
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D7377" />
            </View>
          )}
          {imageError ? (
            <View style={[styles.image, styles.errorContainer]}>
              <Text style={styles.errorText}>Failed to load image</Text>
            </View>
          ) : (
            <Image 
              source={{ uri: imageUrl || undefined }} 
              style={styles.image}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{location.name}</Text>
          <Text style={styles.description}>{location.description}</Text>
          
          {/* Animals Section */}
          {animals && animals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wildlife</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.animalsContainer}
              >
                {animals.map((animal) => (
                  <View key={animal._id} style={styles.animalCard}>
                    <View style={styles.animalContent}>
                      <View style={styles.animalImageContainer}>
                        {!animal.photo ? (
                          <View style={[styles.animalImage, styles.loadingContainer]}>
                            <ActivityIndicator size="small" color="#0D7377" />
                          </View>
                        ) : (
                          <Image 
                            source={{ uri: animal.photo }} 
                            style={styles.animalImage}
                            onError={(e) => console.log('Error loading animal image:', e.nativeEvent.error)}
                          />
                        )}
                      </View>
                      <View style={styles.animalInfo}>
                        <Text style={styles.animalName}>{animal.name}</Text>
                        <Text style={styles.animalDescription} numberOfLines={3}>
                          {animal.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.coordinates}>
            <Text style={styles.coordinateText}>
              Latitude: {location.latitude}
            </Text>
            <Text style={styles.coordinateText}>
              Longitude: {location.longitude}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "#666",
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  animalsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  animalCard: {
    width: 300,
    marginRight: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  animalContent: {
    flexDirection: 'row',
    padding: 10,
  },
  animalImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  animalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  animalInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  animalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  coordinates: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
  },
  coordinateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
}); 