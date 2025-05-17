import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pastTrips"
        options={{
          title: "Past Trips",
          headerBackTitle: "Back",
          headerTintColor: "#0D7377",
        }}
      />
      {/* <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerBackTitle: "Back",
          headerTintColor: "#0D7377",
        }}
      /> */}
    </Stack>
  );
}
