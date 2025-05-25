import Loading from "@/components/Loading";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function Map() {
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [currentRegion, setCurrentRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [compassModalVisible, setCompassModalVisible] = useState(false);
  const [heading, setHeading] = useState(0);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const compassRotation = useRef(new Animated.Value(0)).current;

  // Fetch locations from Convex
  const locations = useQuery(api.locations.getAll);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Start watching heading
        Location.watchHeadingAsync((heading) => {
          setHeading(heading.magHeading);
          Animated.timing(compassRotation, {
            toValue: -heading.magHeading,
            duration: 100,
            useNativeDriver: true,
          }).start();
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkerPress = (location: any) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const handleShowMore = () => {
    setModalVisible(false);
    router.push({
      pathname: "/locationDetails",
      params: { locationId: selectedLocation._id },
    });
  };

  const handleCompassPress = () => {
    setCompassModalVisible(true);
  };

  const getDirectionText = (heading: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  if (locations === undefined) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialCamera={
          currentRegion
            ? {
                center: {
                  latitude: currentRegion.latitude,
                  longitude: currentRegion.longitude,
                },
                pitch: 0,
                heading: 0,
                altitude: 3000,
                zoom: 10,
              }
            : undefined
        }
        showsUserLocation={locationPermission ?? false}
        showsMyLocationButton
        showsCompass={false}
        rotateEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={false}
      >
        {locations?.map((location) => (
          <Marker
            key={location._id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() => handleMarkerPress(location)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.compassButton}
        onPress={handleCompassPress}
      >
        <Ionicons name="compass" size={24} color="#0D7377" />
      </TouchableOpacity>

      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLocation?.name}</Text>
            <Text style={styles.modalDescription}>
              {selectedLocation?.description}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.showMoreButton]}
                onPress={handleShowMore}
              >
                <Text style={styles.showMoreText}>Show More</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Compass Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={compassModalVisible}
        onRequestClose={() => setCompassModalVisible(false)}
      >
        <View style={styles.compassModalContainer}>
          <View style={styles.compassModalContent}>
            <TouchableOpacity
              style={styles.closeCompassButton}
              onPress={() => setCompassModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>

            {/* Direction letter above */}
            <Text style={styles.directionText}>
              {getDirectionText(heading)}
            </Text>

            <View style={styles.compassContainer}>
              <Animated.View
                style={[
                  styles.compassRose,
                  {
                    transform: [
                      {
                        rotate: compassRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name="compass"
                  className="-rotate-45"
                  size={200}
                  color="#0D7377"
                />
              </Animated.View>
            </View>

            {/* Heading number below */}
            <Text style={styles.headingText}>{Math.round(heading)}°</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  compassButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compassModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  compassModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeCompassButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  compassRose: {
    alignItems: "center",
    justifyContent: "center",
  },
  directionText: {
    color: "#222",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  headingText: {
    color: "#222",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  showMoreButton: {
    backgroundColor: "#0D7377",
  },
  showMoreText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f5f5f5",
  },
  closeButtonText: {
    color: "#666",
    textAlign: "center",
    fontWeight: "bold",
  },
});
