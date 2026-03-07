import ThirdPartyOrderCard from "@/components/ThirdPartyOrderCard";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { integrationAPI } from "@/services/api";
import { eventBus } from "@/services/eventBus";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export default function StoreScreen({ route }: { route: any }) {
  const [unProcessOrders, setUnProcessOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const getUnProcessOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await integrationAPI.getUnProcessOrders();
      setUnProcessOrders(response.orders);
    } catch (error) {
      console.error("Error getting unprocessed orders:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 360,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    if (refreshing) {
      // repeat the animation 4 times
      animation.start();
    } else {
      //   rotation.setValue(0);
      animation.reset();
    }
  }, [refreshing]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    getUnProcessOrders();
    eventBus.on("refreshOrders", getUnProcessOrders);
    return () => {
      eventBus.off("refreshOrders", getUnProcessOrders);
    };
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: 48 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          Store Orders •{" "}
          {refreshing ? (
            <ActivityIndicator size="small" color="#8D14CE" />
          ) : (
            unProcessOrders.length
          )}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={{ flex: 1, marginLeft: 10 }}
            placeholder="Search orders"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <FlatList
        data={unProcessOrders.filter((order) =>
          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )}
        ListEmptyComponent={<Text>No orders found</Text>}
        style={{ padding: 16, marginBottom: 100 }}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getUnProcessOrders}
            tintColor="#999"
          />
        }
        renderItem={({ item }) => (
          <ThirdPartyOrderCard
            key={item._id}
            {...item}
            onPress={() => {
              console.log("item", item);
              router.push({
                pathname: "/create-order/cart",
                params: {
                  externalOrderId: item.id,
                  source: item.source,
                  products: JSON.stringify(
                    item.products.map((product: any) => ({
                      _id: product._id,
                      quantity: product.quantity,
                    })),
                  ),
                  address: JSON.stringify({
                    name:
                      item.customer.name || item.deliveryAddress.receiverName,
                    phone: item.deliveryAddress.receiverPhoneNumber,
                    city: item.deliveryAddress.city,
                    state: item.deliveryAddress.state,
                    formattedAddress: item.deliveryAddress.formattedAddress,
                    pincode: item.deliveryAddress.pincode,
                  }),
                },
              });
            }}
          />
        )}
      />
      <AnimatedPressable
        style={[styles.syncButton]}
        onPress={getUnProcessOrders}
      >
        <AnimatedIcon
          name="sync"
          size={24}
          color="#fff"
          style={{ transform: [{ rotate: rotateInterpolate }] }}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8D14CE",
    borderRadius: 25,
    position: "absolute",
    bottom: 120,
    width: 50,
    height: 50,
    right: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    fontFamily: "General-Sans-Medium",
  },
});
