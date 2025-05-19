import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

interface Props {
  src: string;
}

export default function MidImageWithLoading({ src }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View className="w-48 h-48">
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
        className="w-52 h-52"
        onLoad={() => setIsLoading(false)}
      />
    </View>
  );
}
