import { Stack } from 'expo-router';
import React from 'react';

export default function OrdersLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="[status]" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="order-detail" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
} 