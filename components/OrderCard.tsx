import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedPressable from './ui/AnimatedPressable';

export interface OrderCardProps {
  id: string;
  customerName: string;
  date: string;
  status: string;
  fulfillmentType: string;
  onPress: (id: string) => void;
}

// Helper function to get status pill style based on status
const getStatusStyle = (status: string) => {
  switch(status) {
    case 'New':
      return {
        backgroundColor: '#EEFFEE',
        textColor: '#22AA22'
      };
    case 'In Transit':
      return {
        backgroundColor: '#E5F1FF',
        textColor: '#007AFF'
      };
    case 'Delivered':
      return {
        backgroundColor: '#E5F7FF',
        textColor: '#00A3E0'
      };
    case 'Not Ready':
      return {
        backgroundColor: '#FFF5E5',
        textColor: '#FF9500'
      };
    default:
      return {
        backgroundColor: '#EEFFEE',
        textColor: '#22AA22'
      };
  }
};

const OrderCard = ({ id, customerName, date, status, fulfillmentType, onPress }: OrderCardProps) => {
  const statusStyle = getStatusStyle(status);
  
  // Format order ID display: if it's already formatted as ORD-XXX, use it; otherwise format it
  const formatOrderId = (orderId: string) => {
    if (orderId.startsWith('ORD-')) {
      return orderId;
    }
    // Extract last 6 characters and format as ORD-XXXXXX
    return `ORD-${orderId.slice(-6).toUpperCase()}`;
  };
  
  const displayId = formatOrderId(id);
  
  return (
    <AnimatedPressable 
      style={styles.container}
      onPress={() => onPress(id)}
    >
      <View>
        <Text style={styles.orderId}>{displayId}</Text>
        <Text style={styles.customerName}>{customerName}</Text>
        <Text style={styles.orderDate}>{date}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.fulfillmentContainer}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#9254DE" style={styles.truckIcon} />
          <Text style={styles.fulfillmentText}>{fulfillmentType}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{status}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    height: 88,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  fulfillmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckIcon: {
    marginRight: 4,
  },
  fulfillmentText: {
    fontSize: 12,
    color: '#9254DE',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default OrderCard; 