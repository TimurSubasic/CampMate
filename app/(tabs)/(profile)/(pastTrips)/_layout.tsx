import { Stack } from "expo-router";

export default function PastTripsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="pastTrips"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
