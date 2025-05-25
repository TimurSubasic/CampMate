import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { router } from "expo-router";

import React from "react";

import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const steps = [
  {
    title: "Blazes",

    description:
      'Blazes are painted marks on trees or posts. A single blaze means "continue straight". Two blazes stacked vertically mean "start or end of trail". Two blazes with the top offset means "turn in the direction of the offset".',

    image: require("../../../assets/tutorials/trail-blazes.jpg"),
  },

  {
    title: "Trail Markers",

    description:
      "Look for wooden or metal signs at trail intersections. They often show trail names, distances, and directions. Some include difficulty ratings or trail type symbols.",

    image: require("../../../assets/tutorials/trail-markers.jpg"),
  },

  {
    title: "Cairns",

    description:
      "Cairns are stacked rock piles used to mark trails, especially above treeline. Never disturb existing cairns or build new ones, as this could mislead other hikers.",

    image: require("../../../assets/tutorials/trail-cairns.jpg"),
  },

  {
    title: "Difficulty Ratings",

    description:
      "Green circles indicate easy trails, blue squares for intermediate, and black diamonds for difficult trails. Double black diamonds mean expert-level trails.",

    image: require("../../../assets/tutorials/trail-difficulty.jpg"),
  },

  {
    title: "Warning Signs",

    description:
      "Pay attention to warning signs about wildlife, weather conditions, or trail closures. These are crucial for your safety and should never be ignored.",

    image: require("../../../assets/tutorials/trail-warnings.jpg"),
  },

  {
    title: "Trail Etiquette Signs",

    description:
      "Look for signs indicating right-of-way rules, permitted uses (hiking, biking, horses), and special regulations for the area you are in.",

    image: require("../../../assets/tutorials/trail-etiquette.jpg"),
  },
];

export default function TrailSignsTutorial() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-15 pb-5 bg-[#0D7377] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">
          How to Read Trail Signs
        </Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {steps.map((step, index) => (
          <View key={index} className="mb-6 bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-[#0D7377] justify-center items-center mr-3">
                <Text className="text-base font-bold text-white">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-xl font-semibold text-[#1A1A1A]">
                {step.title}
              </Text>
            </View>
            <View className="w-full aspect-[4/3] mb-4">
              <Image
                source={step.image}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>
            <Text className="text-base text-gray-600 leading-6">
              {step.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
