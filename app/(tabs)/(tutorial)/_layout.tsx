import { Stack } from "expo-router";

export default function TutorialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tent-setup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="campfire"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="trail-signs"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
