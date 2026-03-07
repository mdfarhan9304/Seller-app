import { Stack } from 'expo-router';
import React from 'react';
export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'welcome', 
};
const Layout = () => {
  return (
   <Stack screenOptions={{headerShown: false}}>
    <Stack.Screen name='welcome' />
    <Stack.Screen name='index' />
    <Stack.Screen name='verify' />
    <Stack.Screen name='onboard' />
    <Stack.Screen name='under-review' />
    <Stack.Screen name='UPIPayment' />
   </Stack>
  )
} 

export default Layout