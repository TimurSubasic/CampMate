import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { router } from "expo-router";

import React from "react";

import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const steps = [
  {
    title: "Choose a Safe Location",

    description:
      "Find a clear area away from trees and bushes. Look for existing fire pits or create a safe spot by clearing debris in a circle.",

    image: require("../../../assets/tutorials/campfire-location.jpg"),
  },

  {
    title: "Gather Materials",

    description:
      "Collect tinder (dry leaves, paper), kindling (small twigs), and fuel wood (larger sticks and logs). Keep them sorted by size.",

    image: require("../../../assets/tutorials/campfire-materials.jpg"),
  },

  {
    title: "Create the Fire Pit",

    description:
      "If there is no existing pit, create a circle with rocks. Clear all debris within a 10-foot radius of your fire pit.",

    image: require("../../../assets/tutorials/campfire-pit.jpg"),
  },

  {
    title: "Build the Base",

    description:
      "Place your tinder in the center of the pit. Create a small teepee of kindling around the tinder, leaving space for air.",

    image: require("../../../assets/tutorials/campfire-base.jpg"),
  },

  {
    title: "Add Larger Wood",

    description:
      "Arrange larger sticks in a teepee or log cabin pattern around the kindling. Leave gaps for airflow.",

    image: require("../../../assets/tutorials/campfire-structure.jpg"),
  },

  {
    title: "Light and Maintain",

    description:
      "Light the tinder from multiple sides. Once burning, gradually add larger pieces of wood. Monitor and maintain the fire safely.",

    image: require("../../../assets/tutorials/campfire-lighting.jpg"),
  },
];

export default function CampfireTutorial() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-15 pb-5 bg-[#0D7377] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">
          How to Build a Campfire
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
