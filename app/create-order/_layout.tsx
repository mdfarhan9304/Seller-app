import { Stack } from "expo-router";
import React from "react";

export default function CreateOrderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cart" />
    </Stack>
  );
}
