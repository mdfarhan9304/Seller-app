import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import OrderCard from "./OrderCard";
import HeaderPage from "./ui/HeaderPage";
const { height, width } = Dimensions.get("window");

interface OrderStatusScreenProps {
  title: string;
  orders: Array<{
    id: string;
    customerName: string;
    date: string;
    status: string;
    fulfillmentType: string;
  }>;
  onRefresh?: () => void;
}

const OrderStatusScreen = ({
  title,
  orders,
  onRefresh,
}: OrderStatusScreenProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredOrders = orders.filter((order) =>
    (order.customerName + " " + order.id).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleOrderPress = (orderId: string) => {
    // Navigate to order detail screen
    router.push({
      pathname: "/(tabs)/orders/order-detail",
      params: {
        orderId: orderId,
        customerName: orders.find((o) => o.id === orderId)?.customerName || "",
        status: orders.find((o) => o.id === orderId)?.status || "NEW",
      },
    });
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <HeaderPage title={title}>
      <View style={styles.mainContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, order number"
            placeholderTextColor="#999"
          />
        </View>

        {/* Orders List */}
        <View style={styles.ordersSection}>
          <FlatList
            data={filteredOrders}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#8D14CE"]}
                  tintColor="#8D14CE"
                />
              ) : undefined
            }
            // ListHeaderComponent={() => (
            //   <Text style={styles.sectionTitle}>Recents</Text>
            // )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="cube-outline"
                  size={48}
                  color="rgba(0, 0, 0, 0.3)"
                />
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard key={item.id} {...item} onPress={handleOrderPress} />
            )}
          />
        </View>
      </View>
    </HeaderPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  // mainContent: {
  //   // backgroundColor: "rgba(250, 250, 250, 1)",
  //   // height: height,
  //   // position: "absolute",
  //   // top: height * 0.14,
  //   flex: 1,
  //   padding: 16,
  //   width: "100%",
  //   borderRadius: 16,
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 1,
  //   },
  //   shadowOpacity: 0.08,
  //   shadowRadius: 16,
  //   elevation: 2,
  //   marginTop: 12,
  // },
  mainContent: {
    flex: 1,
    padding: 16,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
  
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,

    elevation: 2,

  },
  searchContainer: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 46,
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  ordersSection: {
    // paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#666",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.7)",
    marginTop: 20,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
  },
});

export default OrderStatusScreen;
