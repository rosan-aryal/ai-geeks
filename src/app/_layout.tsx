import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { queryClient } from "@/lib/query-client";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ title: "OSINT" }} />
            <Stack.Screen name="results" options={{ title: "Results" }} />
            <Stack.Screen name="finding/[id]" options={{ title: "Detail" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
