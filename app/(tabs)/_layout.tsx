import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: "#F4A300",
        tabBarInactiveTintColor: "#1A1A1A",
        tabBarStyle: {
          backgroundColor: "#0D7377",
          paddingTop: 10,
          height: 50,
          elevation: 0,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={26} name="house" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={26} name="map-location-dot" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: "Trip",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="campground" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tutorial)"
        options={{
          title: "Tutorial",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={26} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={26} name="user-gear" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
