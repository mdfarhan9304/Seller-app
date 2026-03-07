import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View
} from "react-native";

export type ModalContextType = {
  openModal: (modal: React.ReactNode) => Promise<any>;
  closeModal: (data?: any) => void;
  closeAllModals: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

type ModalItem = {
  id: string;
  content: React.ReactNode;
  translateY: Animated.Value;
  resolver: ((value: any) => void) | null;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, setModals] = useState<ModalItem[]>([]);
  const modalsRef = useRef<ModalItem[]>([]);

  // Keep ref in sync with state
  React.useEffect(() => {
    modalsRef.current = modals;
  }, [modals]);

  const openModal = useCallback((modal: React.ReactNode) =>
    new Promise((resolve, reject) => {
      const modalId = Date.now().toString() + Math.random().toString(36);
      const translateY = new Animated.Value(Dimensions.get("window").height);
      
      const newModal: ModalItem = {
        id: modalId,
        content: modal,
        translateY,
        resolver: resolve,
      };

      setModals(prev => {
        const newModals = [...prev, newModal];
        modalsRef.current = newModals;
        return newModals;
      });
      
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }), []);

  const closeModal = useCallback((data?: any) => {
    const currentModals = modalsRef.current;
    
    if (currentModals.length === 0) return;
    
    const topModal = currentModals[currentModals.length - 1];
    
    // Animate the top modal out
    Animated.timing(topModal.translateY, {
      toValue: Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Remove the modal from state and resolve its promise after animation
      setModals(current => {
        if (current.length === 0) return current;
        const modalToClose = current[current.length - 1];
        modalToClose.resolver?.(data);
        const newModals = current.slice(0, -1);
        modalsRef.current = newModals;
        return newModals;
      });
    });
  }, []);

  const closeAllModals = useCallback(() => {
    const currentModals = modalsRef.current;
    currentModals.forEach(modal => {
      Animated.timing(modal.translateY, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        modal.resolver?.(undefined);
      });
    });
    setModals([]);
    modalsRef.current = [];
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      {modals.length > 0 && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          onRequestClose={() => closeModal()}
        >
          {/* Render all modals within a single Modal component */}
          {modals.map((modal, index) => {
            const opacity = modal.translateY.interpolate({
              inputRange: [0, Dimensions.get("window").height],
              outputRange: [0.7, 0],
            });
            
            return (
              <View
                key={modal.id}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  zIndex: 1000 + index,
                }}
                pointerEvents={index === modals.length - 1 ? "auto" : "box-none"}
              >
                {/* <BlurView intensity={30} style={StyleSheet.absoluteFillObject} /> */}
                <AnimatedPressable
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "black",
                    opacity: opacity,
                  }}
                  onPress={() => closeModal()}
                />
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                  }}
                  keyboardVerticalOffset={0}
                >
                  <Animated.View
                    style={{
                      backgroundColor: "white",
                      padding: 16,
                      paddingBottom: 32,
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      transform: [{ translateY: modal.translateY }],
                      maxHeight: Dimensions.get("window").height * 0.9,
                      // minHeight: Dimensions.get("window").height * 0.5,
                      // Add slight offset for stacked modals
                      // marginRight: index * 2,
                      // marginLeft: index * 2,
                      // Ensure proper stacking
                      elevation: 1000 + index, // For Android
                      zIndex: 1000 + index, // For iOS
                    }}
                  >
                    <Pressable
                      style={{
                        position: "absolute",
                        top: -56,
                        right: 16,
                        backgroundColor: "white",
                        borderRadius: 32,
                        padding: 8,
                        elevation: 1001 + index,
                        zIndex: 1001 + index,
                      }}
                      onPress={() => closeModal()}
                    >
                      <Ionicons name="close" size={24} color="#000000" />
                    </Pressable>
                    <View
                      style={{
                        width: 40,
                        height: 4,
                        backgroundColor: "#E5E7EB",
                        borderRadius: 2,
                        alignSelf: "center",
                        marginBottom: 16,
                      }}
                    />

                    {modal.content}
                  </Animated.View>
                </KeyboardAvoidingView>
              </View>
            );
          })}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};
