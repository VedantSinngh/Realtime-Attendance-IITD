import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import { AuthProvider } from "../services/AuthContext";
import { LeaveProvider } from "../app/profile/leave-context"; 
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LeaveProvider> {/* Wrap entire app */}
          <Stack>
            {/* Public routes (no auth) */}
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/signin" options={{ headerShown: false }} />

            {/* Protected section */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="clock" options={{ headerShown: false }} />
            <Stack.Screen name="face-verification" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
        </LeaveProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}