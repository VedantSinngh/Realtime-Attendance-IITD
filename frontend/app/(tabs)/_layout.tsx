import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: () => <Ionicons name="home" size={20} /> }} />
      <Tabs.Screen name="activity" options={{ title: "Activity", tabBarIcon: () => <Ionicons name="list" size={20} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => <Ionicons name="person" size={20} /> }} />
    </Tabs>
  );
}
