import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { Link } from "expo-router";

import React from "react";

import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const tutorials = [
  {
    id: "tent-setup",

    title: "How to Set Up a Tent",

    description: "Learn the proper way to set up your camping tent",

    icon: "tent",
  },

  {
    id: "campfire",

    title: "How to Build a Campfire",

    description: "Master the art of building and maintaining a safe campfire",

    icon: "fire",
  },

  {
    id: "trail-signs",

    title: "How to Read Trail Signs",

    description: "Understand common trail markers and navigation signs",

    icon: "signs-post",
  },
];

export default function TutorialsScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-15 pb-5 bg-[#0D7377]">
        <Text className="text-3xl font-bold text-white">Camping Tutorials</Text>
        <Text className="text-base text-white/80 mt-1">
          Learn essential camping skills
        </Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {tutorials.map((tutorial) => (
          <Link key={tutorial.id} href={`/${tutorial.id}`} asChild>
            <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl mb-4 shadow-sm">
              <View className="w-15 h-15 rounded-full bg-[#E8F6F7] justify-center items-center">
                <FontAwesome6 name={tutorial.icon} size={32} color="#0D7377" />
              </View>
              <View className="flex-1 mx-4">
                <Text className="text-lg font-semibold text-[#1A1A1A]">
                  {tutorial.title}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {tutorial.description}
                </Text>
              </View>
              <FontAwesome6 name="chevron-right" size={20} color="#0D7377" />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}
