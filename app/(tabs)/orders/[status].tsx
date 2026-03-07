import HeaderPage from "@/components/ui/HeaderPage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import OrderStatusScreen from "../../../components/OrderStatusScreen";
import { Order, orderAPI } from "../../../services/api";

export const FULLFILMENT_TYPE = {
  three_days: "Three Days",
  standard: "Standard",
  instant: "Instant",
  sc_instant: "Same Day",
  sc_express: "Express",
  dc_normal: "Standard",
  dc_express: "Express",
};

// Configuration for different order statuses
const STATUS_CONFIG: Record<
  string,
  {
    apiStatus: string;
    title: string;
    getCustomerName: (order: Order) => string;
    getStatusLabel: (order: Order) => string;
    getFulfillmentType: (order: Order) => string;
  }
> = {
  "new-orders": {
    apiStatus: "new",
    title: "New Orders",
    getCustomerName: (order: Order) => order.customer?.fullName || "Customer",
    getStatusLabel: (order: Order) =>
      order.status === "CONFIRMED" ? "New" : order.status,
    getFulfillmentType: (order: Order) =>
      FULLFILMENT_TYPE[order.deliveryMode as keyof typeof FULLFILMENT_TYPE] ||
      order.deliveryMode,
  },
  "to-be-dispatched": {
    apiStatus: "ready-to-ship",
    title: "To be dispatched",
    getCustomerName: (order: Order) => order.customer?.fullName || "Customer",
    getStatusLabel: () => "To be dispatched",
    getFulfillmentType: (order: Order) =>
      FULLFILMENT_TYPE[order.deliveryMode as keyof typeof FULLFILMENT_TYPE] ||
      order.deliveryMode,
  },
  "in-transit": {
    apiStatus: "dispatched",
    title: "In Transit",
    getCustomerName: (order: Order) => order.customer?.fullName || "Customer",
    getStatusLabel: () => "In Transit",
    getFulfillmentType: (order: Order) =>
      FULLFILMENT_TYPE[order.deliveryMode as keyof typeof FULLFILMENT_TYPE] ||
      order.deliveryMode,
  },
  delivered: {
    apiStatus: "delivered",
    title: "Delivered",
    getCustomerName: (order: Order) => order.customer?.fullName || "Customer",
    getStatusLabel: () => "Delivered",
    getFulfillmentType: (order: Order) =>
      FULLFILMENT_TYPE[order.deliveryMode as keyof typeof FULLFILMENT_TYPE] ||
      order.deliveryMode,
  },
};

const OrderStatusScreenWrapper = () => {
  const params = useLocalSearchParams();
  const statusKey = (params.status as string) || "new-orders";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG["new-orders"];

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getOrdersByStatus(
        config.apiStatus as any
      );

      // Transform API orders to match OrderCard format
      const transformedOrders = response.orders.map((order: Order) => ({
        id: order._id,
        customerName: config.getCustomerName(order),
        date: new Date(order.createdAt).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        status: config.getStatusLabel(order),
        fulfillmentType: config.getFulfillmentType(order),
      }));

      console.log(
        "transformedOrders",
        JSON.stringify(transformedOrders, null, 2)
      );
      setOrders(transformedOrders);
    } catch (err: any) {
      console.error(`Error fetching ${statusKey} orders:`, err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HeaderPage title={config.title} loading={loading} />
    );
  }

  return (
    <OrderStatusScreen
      title={config.title}
      orders={orders}
      onRefresh={fetchOrders}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
});

export default OrderStatusScreenWrapper;
