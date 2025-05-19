import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  View,
} from "react-native";

interface Props {
  src: string;
}

export default function LargeImageWithLoading({ src }: Props) {
  const screenWidth = Dimensions.get("window").width - 40;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{ width: screenWidth, height: screenWidth }}>
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
        style={{ width: screenWidth, height: screenWidth }}
        onLoad={() => setIsLoading(false)}
      />
    </View>
  );
}
