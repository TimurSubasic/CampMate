import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RatingProps {
  rating: number;
  totalRatings?: number;
  size?: "small" | "medium" | "large";
  onRate?: (rating: number) => void;
  interactive?: boolean;
}

export default function Rating({
  rating,
  totalRatings,
  size = "medium",
  onRate,
  interactive = false,
}: RatingProps) {
  const iconSize = {
    small: 16,
    medium: 24,
    large: 32,
  }[size];

  const textSize = {
    small: 12,
    medium: 14,
    large: 16,
  }[size];

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onRate?.(star)}
        disabled={!interactive}
      >
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={iconSize}
          color="#FFD700"
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      {totalRatings !== undefined && (
        <Text style={[styles.totalRatings, { fontSize: textSize }]}>
          ({totalRatings})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
  totalRatings: {
    marginLeft: 4,
    color: "#666",
  },
});
