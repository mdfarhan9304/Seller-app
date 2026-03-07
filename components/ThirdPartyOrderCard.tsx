import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AnimatedPressable from "./ui/AnimatedPressable";

export interface ThirdPartyOrderCardProps {
  id: string;
  customerName: string;
  date: string;
  status: string;
  fulfillmentType: string;
  onPress: (id: string) => void;
}

// Helper function to get status pill style based on status
const getStatusStyle = (status: string) => {
  switch (status) {
    case "New":
      return {
        backgroundColor: "#EEFFEE",
        textColor: "#22AA22",
      };
    case "In Transit":
      return {
        backgroundColor: "#E5F1FF",
        textColor: "#007AFF",
      };
    case "Delivered":
      return {
        backgroundColor: "#E5F7FF",
        textColor: "#00A3E0",
      };
    case "Not Ready":
      return {
        backgroundColor: "#FFF5E5",
        textColor: "#FF9500",
      };
    default:
      return {
        backgroundColor: "#EEFFEE",
        textColor: "#22AA22",
      };
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ThirdPartyOrderCard = ({
  _id,
  id,
  customer,
  createdAt,
  deliveryAddress,
  totalPrice,
  productsPrice,
  products,
  deliveryFees,
  discountAmt,
  source,
  onPress,
  ...props
}: any) => {
  // const statusStyle = getStatusStyle(status);

  // Format order ID display: if it's already formatted as ORD-XXX, use it; otherwise format it
  const formatOrderId = (orderId: string) => {
    if (orderId.startsWith("ORD-")) {
      return orderId;
    }
    // Extract last 6 characters and format as ORD-XXXXXX
    return `ORD-${orderId.slice(-6).toUpperCase()}`;
  };

  // const displayId = id;

  return (
    <AnimatedPressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.orderId}>{formatDate(createdAt)}</Text>
        <Text style={styles.fulfillmentText}>₹{totalPrice}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <FontAwesome6 name={source} size={16} color="#666" />
      </View>
      {products.map((product: any, index: number) => (
        <View key={id + product.id + index}>
          <Text>
            {product.name} x {product.quantity}
          </Text>
        </View>
      ))}
      {deliveryAddress.pincode && (
        <View style={styles.deliveryAddressContainer}>
          <Text style={styles.deliveryAddressTitle}>Deliver to:</Text>
          <Text style={styles.deliveryAddress}>
            {deliveryAddress.formattedAddress}, {deliveryAddress.city},{" "}
            {deliveryAddress.state}, {deliveryAddress.pincode}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderId: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
  },
  fulfillmentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  truckIcon: {
    marginRight: 4,
  },
  fulfillmentText: {
    fontSize: 12,
    color: "#9254DE",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deliveryAddressContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
  },
  deliveryAddressTitle: {
    fontSize: 10,
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ThirdPartyOrderCard;
