import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface OrderSummaryCardProps {
  label: string;
  count: number;
  iconName: string;
  route: string;
}

const OrderSummaryCard = ({ label, count, iconName, route }: OrderSummaryCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(route as any);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{count}</Text>
      
      </View>
      <View >
        <MaterialCommunityIcons name={iconName as any} size={24} color="#F5C445" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(245, 245, 245, 0.24);",
    borderRadius: 12,
    width: '48%',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
   
    marginBottom: 4,
    fontFamily: "General-Sans-Medium",
    // text white
    color: '#FFFFFF',
  },
  count: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    fontWeight: '600',
    color: '#FFFFFF',
  },
 
});

export default OrderSummaryCard; 