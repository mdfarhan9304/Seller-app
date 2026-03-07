import { ProductUpdationProvider } from "@/contexts/ProductUpdationContext";
import { integrationAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";

export default function TabLayout() {
  const pathname = usePathname();
  const [integrations, setIntegrations] = useState<any>({});

  // Hide tab bar on nested screens
  const isMainTabScreen = ["/home", "/orders", "/account", "/store"].includes(pathname);

  useEffect(() => {
    const getIntegrations = async () => {
      const integrations = await integrationAPI.getIntegrations();
      console.log(integrations);
      setIntegrations(integrations?.integrations);
    }

    getIntegrations();
  }, [])

  return (
    <ProductUpdationProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 108,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingTop: 16,
            elevation: 8,
            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            display: isMainTabScreen ? "flex" : "none",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarActiveTintColor: "#8D14CE",
          tabBarInactiveTintColor: "rgba(0, 0, 0, 0.5)",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            fontFamily: "General-Sans-Medium",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarItemStyle: {
            paddingTop: 0,
            width: "33.33%",
          },
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      {<Tabs.Screen
          name="store"
          
          options={{
            title: "Store",
            href: integrations.wix ? "/store" : null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={"storefront-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        }
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </ProductUpdationProvider>
  );
}
