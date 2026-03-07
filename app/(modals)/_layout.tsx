import { ProductUpdationProvider } from "@/contexts/ProductUpdationContext";
import { Stack } from "expo-router";
import React from "react";

export default function ModalsLayout() {
  return (
    <ProductUpdationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </ProductUpdationProvider>
  );
}
