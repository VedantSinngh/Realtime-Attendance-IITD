import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        {/* Auth / onboarding flow */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ title: "Welcome" }} />
        <Stack.Screen name="onboarding/signin" options={{ title: "Sign In" }} />
        <Stack.Screen name="onboarding/otp-verify" options={{ title: "Verify OTP" }} />

        {/* Face verification */}
        <Stack.Screen name="face-verification/pre" options={{ title: "Setup Face ID" }} />
        <Stack.Screen name="face-verification/process" options={{ title: "Scan Face" }} />
        <Stack.Screen name="face-verification/post" options={{ title: "Done" }} />

        {/* Main app (tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Clock flows */}
        <Stack.Screen name="clock/clock-in" options={{ title: "Clock In" }} />
        <Stack.Screen name="clock/clock-in-confirm" options={{ title: "Confirm" }} />
      </Stack>
    </SafeAreaProvider>
  );
}