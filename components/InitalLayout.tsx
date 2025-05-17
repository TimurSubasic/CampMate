import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitalLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const inAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return null; // loader component later
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
