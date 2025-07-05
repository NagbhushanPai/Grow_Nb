import React from "react";
import "react-native-reanimated";
import "react-native-gesture-handler";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import TodoScreen from "./app/(tabs)/index";
import FitnessScreen from "./app/(tabs)/fitness";
import CodingScreen from "./app/(tabs)/coding"; 
import JournalScreen from "./app/(tabs)/journal";
import SettingsScreen from "./app/(tabs)/settings";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === "To-Do") {
              iconName = focused ? "checkbox" : "checkbox-outline";
            } else if (route.name === "Fitness") {
              iconName = focused ? "fitness" : "fitness-outline";
            } else if (route.name === "Coding") {
              iconName = focused ? "code-slash" : "code-slash-outline";
            } else if (route.name === "Journal") {
              iconName = focused ? "book" : "book-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="To-Do" component={TodoScreen} />
        <Tab.Screen name="Fitness" component={FitnessScreen} />
        <Tab.Screen name="Coding" component={CodingScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}