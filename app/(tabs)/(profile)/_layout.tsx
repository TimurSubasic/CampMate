import { Stack, useSegments } from "expo-router";

export default function ProfileLayout() {
  const segments = useSegments();
  return (
    <Stack
      screenOptions={{
        animation: segments[1] === "(profile)" ? "default" : "none",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(pastTrips)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
