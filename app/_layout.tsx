import { FontProvider } from "@/contexts/FontProvider";
import { ModalProvider } from "@/contexts/ModalContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { saveToken } from "@/services/notifications";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
// @ts-ignore - react-native-push-notification doesn't have types
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import PushNotification from "react-native-push-notification";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ProtectedRouteProvider } from "../contexts/ProtectedRouteContext";

// Configure push notifications based on platform
if (Platform.OS === "ios") {
  PushNotificationIOS.addEventListener("register", (token: string) => {
    saveToken(token);
  });
} else if (Platform.OS === "android") {
  PushNotification.configure({
    onRegister: function (token: { os: string; token: string }) {
      console.log("FCM Token:", token);
      saveToken(token.token);
    },
    onNotification: function (notification: any) {
      console.log("NOTIFICATION:", notification);
    },
    requestPermissions: true,
    popInitialNotification: true,
  });
}
function RootLayoutNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { authState } = useAuth();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // Don't navigate until auth is done loading
    // Request push notification permissions based on platform
    if (Platform.OS === "ios") {
      PushNotificationIOS.requestPermissions();
    }
    // Android permissions are handled via PushNotification.configure() at app startup

    if (authState.isLoading) return;

    // Prevent multiple navigations - only navigate once on initial load
    if (hasNavigatedRef.current) {
      console.log("Already navigated, skipping navigation");
      return;
    }

    // Only navigate if we're on the root/index path
    const isOnRootPath =
      pathname === "/" || pathname === "/index" || !pathname || pathname === "";
    const isOnAuthScreen = pathname?.includes("/(auth)");
    const isOnTabScreen = pathname?.includes("/(tabs)");

    if (!isOnRootPath && (isOnAuthScreen || isOnTabScreen)) {
      console.log("User already on screen:", pathname, "- not navigating");
      hasNavigatedRef.current = true;
      return;
    }

    const navigateBasedOnAuth = async () => {
      hasNavigatedRef.current = true;

      if (authState.isAuthenticated && authState.user) {
        const hasStoreData =
          authState.store &&
          (authState.store.name ||
            authState.store.subdomain ||
            authState.store._id);
        const hasSellerData =
          authState.seller &&
          (authState.seller.businessName ||
            authState.seller._id ||
            authState.seller.email);
        const isRegistered = hasStoreData || hasSellerData;

        if (isRegistered) {
          console.log("User is registered, navigating to home");
          router.replace("/(tabs)/home");
        } else {
          console.log(
            "User authenticated but not registered, navigating to onboard",
          );
          router.replace("/(auth)/onboard");
        }
      } else {
        console.log("User not authenticated, navigating to welcome");
        router.replace("/(auth)/welcome");
      }
    };

    navigateBasedOnAuth();
  }, [authState.isLoading]);

  const onRemoteNotification = (notification: any) => {
    const notificationData =
      Platform.OS === "ios" ? notification.getData() : notification.data;
    console.log("Notification data:", notificationData);
    if (notificationData?.type === "navigateToScreen") {
      router.push({
        pathname: notificationData.screen,
        params: { ...notificationData, notification: true },
      });
    }
  };

  useEffect(() => {
    if (Platform.OS === "ios") {
      const type = "notification";
      PushNotificationIOS.addEventListener(type, onRemoteNotification);
      return () => {
        PushNotificationIOS.removeEventListener(type);
      };
    }
    // Android notifications are handled in PushNotification.configure()
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ headerShown: false }} />
      <Stack.Screen name="create-order" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedRouteProvider>
        <ModalProvider>
          <FontProvider>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
          </FontProvider>
        </ModalProvider>
      </ProtectedRouteProvider>
    </AuthProvider>
  );
}
