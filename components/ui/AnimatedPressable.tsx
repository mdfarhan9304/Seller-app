import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
} from "react-native";

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

const AnimatedPressable = ({
  children,
  loading = false,
  onPressIn,
  onPressOut,
  style,
  ...otherProps
}: PressableProps & { loading?: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = (event: GestureResponderEvent) => {
    if (otherProps.disabled) {
      return;
    }
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    if (otherProps.disabled) {
      return;
    }
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    onPressOut?.(event);
  };
  const styles = [
    { transform: [{ scale }] },
    ...(Array.isArray(style) ? style : []),
    ...(style ? ([style] as any) : []),
    
  ];
  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      disabled={otherProps.disabled || loading}
      onPressOut={handlePressOut}
      style={styles}
      {...otherProps}
    >
      {loading ? <ActivityIndicator size={16} color="#000000" /> : children}
    </AnimatedPressableComponent>
  );
};

export default AnimatedPressable;
