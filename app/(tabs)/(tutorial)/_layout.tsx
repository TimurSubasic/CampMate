import { Stack } from "expo-router";

export default function TutorialLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tutorial"
        options={{
          title: "Tutorial",
        }}
      />
      <Stack.Screen
        name="compass"
        options={{
          title: "Compass",
        }}
      />
      <Stack.Screen
        name="barometer"
        options={{
          title: "Barometer",
        }}
      />
    </Stack>
  );
}
