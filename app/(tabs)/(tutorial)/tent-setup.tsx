import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { router } from "expo-router";

import React from "react";

import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const imageWidth = width - 32;

const steps = [
  {
    title: "Choose the Perfect Spot",

    description:
      "Find level ground free from rocks and sticks. Look for a spot that is slightly elevated to avoid water pooling.",

    image: require("../../../assets/tutorials/tent-spot.jpg"),
  },

  {
    title: "Lay Out Your Tent",

    description:
      "Unpack your tent and lay out all components. Place the footprint (ground cloth) down first if you have one.",

    image: require("../../../assets/tutorials/tent-layout.jpg"),
  },

  {
    title: "Assemble the Poles",

    description:
      "Connect your tent poles according to their color coding or numbers. Most modern tents use a sleeve or clip system.",

    image: require("../../../assets/tutorials/tent-poles.jpg"),
  },

  {
    title: "Attach the Tent Body",

    description:
      "Insert the poles through the sleeves or connect them to clips on the tent body. The tent should start taking shape.",

    image: require("../../../assets/tutorials/tent-body.jpg"),
  },

  {
    title: "Secure the Rainfly",

    description:
      "If your tent comes with a rainfly, drape it over the tent body and secure it to the poles or tent base.",

    image: require("../../../assets/tutorials/tent-rainfly.jpg"),
  },

  {
    title: "Stake it Down",

    description:
      "Use stakes to secure your tent to the ground. Make sure to pull the tent taut but not so tight that it stresses the fabric.",

    image: require("../../../assets/tutorials/tent-stakes.jpg"),
  },
];

export default function TentSetupTutorial() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-15 pb-5 bg-[#0D7377] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">
          How to Set Up a Tent
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
