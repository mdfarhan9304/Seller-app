import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  value, 
  onValueChange,
}) => {
  const toggleAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, toggleAnimation]);

  return (
    <TouchableOpacity 
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.toggleSwitch,
          {
            backgroundColor: toggleAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['#E5E5E5', '#8D14CE'],
            }),
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.toggleThumb,
            {
              transform: [{
                translateX: toggleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              }],
            }
          ]} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ToggleSwitch;

const styles = StyleSheet.create({
  toggleSwitch: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    justifyContent: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

