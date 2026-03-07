import React, { createContext, useContext, useEffect, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export const ToastContext = createContext<{
  toast: { message: string; timeout?: number } | null;
  showToast: (message: string, timeout?: number) => void;
}>({
  toast: null,
  showToast: (message: string, timeout?: number) => {},
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toastOpacity = new Animated.Value(0);
  const [toast, setToast] = useState<{
    message: string;
    timeout?: number;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setToast(null);
        });
      }, toast.timeout || 1000);
    }
  }, [toast]);

  return (
    <ToastContext.Provider
      value={{
        toast,
        showToast: (message, timeout) => setToast({ message, timeout }),
      }}
    >
      {children}
      {toast ? (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    zIndex: 1000,
    position: "absolute",
    bottom: 100,
    marginHorizontal: 16,
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "center",
  },
  toastText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});
