import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

interface Props {
  src: string;
}

export default function ProfileImage({ src }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View className="w-16 h-16 rounded-full">
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size={"large"} />
        </View>
      )}
      <Image
        source={{ uri: src }}
        className="w-16 h-16 rounded-full"
        onLoad={() => setIsLoading(false)}
      />
    </View>
  );
}
