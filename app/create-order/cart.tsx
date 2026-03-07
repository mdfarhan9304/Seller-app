import AnimatedPressable from "@/components/ui/AnimatedPressable";
import HeaderPage from "@/components/ui/HeaderPage";
import { Colors } from "@/constants/Colors";
import { useModal } from "@/contexts/ModalContext";
import { orderAPI } from "@/services/api";
import { eventBus } from "@/services/eventBus";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AddressForm } from "./_components/AddressForm";
import ScheduleSelector, { formatDate } from "./_components/ScheduleSelector";

const getParsedAddress = (address: string) => {
  try {
    return JSON.parse(address);
  } catch (error) {
    return undefined;
  }
};

export default function CartScreen() {
  const router = useRouter();
  const {
    products,
    address: addressParams,
    externalOrderId,
    source,
  } = useLocalSearchParams();
  const [cartProducts, setCartProducts] = useState(
    JSON.parse(products as string).reduce((acc: any, product: any) => {
      if (product.quantity) {
        acc[product._id] = product.quantity;
      } else {
        acc[product] = 1;
      }
      return acc;
    }, {}),
  );
  const [address, setAddress] = useState<any>(
    getParsedAddress(addressParams as string),
  );
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(1);
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<
    string | undefined
  >(undefined);
  const [cart, setCart] = useState<any>({});
  const { openModal, closeModal } = useModal();
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const createCart = async (isFinal: boolean = false) => {
    console.log("dateTime", dateTime);
    setLoading(true);
    const finalCartProducts = Object.keys(cartProducts).filter(
      (product) => cartProducts[product] > 0,
    );
    if (finalCartProducts.length > 0) {
      const productsArray = Object.entries(cartProducts).map(
        ([product, quantity]: any) => ({
          id: product,
          quantity: quantity,
        }),
      );
      const response = await orderAPI.createCart(
        productsArray,
        address,
        selectedDeliveryMode,
        weight,
        isFinal,
        dateTime || undefined,
        externalOrderId as string,
        source as string,
      );
      setCart(response.cart || {});
      if (response.order) {
        router.dismissAll();
        router.replace({
          pathname: "/(tabs)/orders/order-detail",
          params: {
            orderId: response.order._id,
            notification: "true",
          },
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    createCart();
  }, [cartProducts, address, selectedDeliveryMode, weight]);

  const formatCustomerAddress = (address: any) => {
    return `*Customer Name*: ${address?.name}\n*Phone*: ${address?.phone}\n\n*Customer Address*:\n${address?.formattedAddress}\n${address?.city}, ${address?.state}, ${address?.pincode}`;
  };

  const formatStoreAddress = (
    address: any,
    storePhone: string,
    storeName: string,
  ) => {
    return `*Store Name*: ${storeName}\n*Phone*: ${storePhone}\n\n*Store Address*:\n${address?.floor} Floor, ${address?.buildingName}, ${address?.fullAddress}\nGoogle Maps: https://maps.google.com/?q=${address?.latitude},${address?.longitude}`;
  };

  const createOrder = async () => {
    createCart(true);
    // send on whatsapp
    const whatsappMessage = `
    Hello from ${
      cart?.storeName
    } 👋.\nI want to create an order.\n\n${formatCustomerAddress(
      address,
    )}\n\n${formatStoreAddress(
      cart?.sourceAddress,
      cart?.storePhone,
      cart?.storeName,
    )}\n\n*Delivery Mode:* ${cart?.applicableDeliveryMode?.name} (${
      cart?.applicableDeliveryMode?.deliveryTime
    })\n*Weight:* ${weight} KGs\n*Products Price:* ₹ ${
      cart?.productsPrice
    }\n*Delivery Fees:* ₹ ${cart?.deliveryFees}\n*Pickup Time:* ${
      dateTime ? formatDate(dateTime) : "Not Scheduled"
    }
    `;
    const whatsappUrl = `https://wa.me/919998287881?text=${encodeURIComponent(
      whatsappMessage,
    )}`;
    Linking.openURL(whatsappUrl);
    eventBus.emit("refreshOrders");
  };

  return (
    <HeaderPage title="Cart">
      <ScrollView>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cart Items</Text>
          {cart?.cart?.map((product: any) => (
            <View style={styles.cartItem} key={product._id}>
              <Image
                source={{ uri: product.images[0] }}
                style={styles.cartItemImage}
              />
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.priceContainer}>
                  {product.originalPrice !== product.sellingPrice &&
                    product.originalPrice &&
                    product.originalPrice !== "0" && (
                      <Text style={styles.originalPrice}>
                        ₹{product.originalPrice}
                      </Text>
                    )}
                  <Text style={styles.sellingPrice}>₹{product.totalPrice}</Text>
                </View>
              </View>
              <View style={styles.stepperContainer}>
                <AnimatedPressable
                  disabled={loading}
                  style={styles.stepperButton}
                  onPress={() => {
                    if (product.quantity === 1) {
                      console.log(
                        "Object.keys(cartProducts)",
                        Object.keys(cartProducts),
                      );
                      if (Object.keys(cartProducts).length === 1) {
                        router.back();
                      }
                      const newCartProducts = { ...cartProducts };
                      delete newCartProducts[product._id];
                      setCartProducts(newCartProducts);
                    } else {
                      setCartProducts((prev: any) => ({
                        ...prev,
                        [product._id]: prev[product._id] - 1,
                      }));
                    }
                  }}
                >
                  <Ionicons name="remove" size={16} color="#333" />
                </AnimatedPressable>
                <Text style={styles.stepperText}>{product.quantity}</Text>
                <AnimatedPressable
                  disabled={loading}
                  style={styles.stepperButton}
                  onPress={() => {
                    setCartProducts((prev: any) => ({
                      ...prev,
                      [product._id]: prev[product._id] + 1,
                    }));
                  }}
                >
                  <Ionicons name="add" size={16} color="#333" />
                </AnimatedPressable>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <AnimatedPressable
            style={styles.addressButton}
            onPress={async () => {
              // const address = {
              //   name: "John Doe",
              //   phone: "1234567890",
              //   formattedAddress: "123 Main St, Anytown, USA",
              //   city: "Anytown",
              //   state: "CA",
              //   pincode: "110026",
              // };
              // setAddress(address);
              const savedAddress = await openModal(
                <AddressForm initialData={address} />,
              );
              if (savedAddress) {
                setAddress(savedAddress);
              }
            }}
          >
            <View style={{ flex: 1 }}>
              {address ? (
                <Text style={styles.addressText}>
                  {address?.name}, {address?.phone}
                </Text>
              ) : null}
              <Text style={styles.addressTextDetails}>
                {address?.formattedAddress || "Enter Customer Address"}
                {address ? (
                  <Text style={styles.addressTextDetails}>
                    , {address?.city}, {address?.state}, {address?.pincode}
                  </Text>
                ) : null}
              </Text>
            </View>
            <View style={{}}>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
          </AnimatedPressable>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Delivery Mode</Text>
          <View style={styles.deliveryModeContainer}>
            {cart?.applicableDeliveryModes?.map((deliveryMode: any) => (
              <AnimatedPressable
                style={[
                  styles.deliveryModeItem,
                  deliveryMode.isSelected
                    ? styles.selectedDeliveryModeItem
                    : {},
                ]}
                key={deliveryMode.type}
                onPress={() => {
                  if (deliveryMode.type !== selectedDeliveryMode) {
                    setSelectedDeliveryMode(deliveryMode.type);
                  }
                }}
              >
                <Ionicons
                  style={styles.deliveryModeIcon}
                  name={deliveryMode.icon}
                  size={20}
                  color={deliveryMode.isSelected ? Colors.black : "#666"}
                />
                <View>
                  <Text style={styles.deliveryModeText}>
                    {deliveryMode.name}
                  </Text>
                  <Text style={styles.deliveryModeTime}>
                    {deliveryMode.deliveryTime}
                  </Text>
                </View>
                <Text style={styles.deliveryModeFees}>
                  ₹ {deliveryMode.deliveryFees}
                </Text>
              </AnimatedPressable>
            )) || (
              <Text style={styles.deliveryModeError}>Select Address First</Text>
            )}
          </View>
        </View>
        {cart?.isWeightRequired ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Weight (in KGs)</Text>
            <View
              style={[
                styles.stepperContainer,
                {
                  marginLeft: 0,
                  height: 50,
                  width: "100%",
                },
              ]}
            >
              <AnimatedPressable
                style={styles.stepperButton}
                onPress={() => {
                  if (weight > 1) {
                    setWeight(weight - 1);
                  } else if (weight === 1 && cart?.isStaggeredWeightAllowed) {
                    setWeight(0.5);
                  }
                }}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </AnimatedPressable>
              <Text style={styles.stepperText}>{weight}</Text>
              <AnimatedPressable
                style={styles.stepperButton}
                onPress={() => {
                  if (weight === 0.5) {
                    setWeight(1);
                  } else {
                    setWeight(weight + 1);
                  }
                }}
              >
                <Ionicons name="add" size={20} color="#333" />
              </AnimatedPressable>
            </View>
          </View>
        ) : null}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pickup Time</Text>
          <ScheduleSelector onDateTimeChange={setDateTime} />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            {/* <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Products Price</Text>
              <Text style={styles.summaryItemValue}>
                ₹ {cart?.productsPrice}
              </Text>
            </View> */}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>
                Delivery Fees {cart.isWeightRequired ? `(${weight} KGs)` : ""}
              </Text>
              <Text style={styles.summaryItemValue}>
                ₹ {cart?.deliveryFees}
              </Text>
            </View>
            {/* <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Total Price</Text>
              <Text style={styles.summaryItemValue}>₹ {cart?.totalPrice}</Text>
            </View> */}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <AnimatedPressable
          disabled={loading}
          style={[
            styles.button,
            loading || !cart?.allDetailsCollected ? styles.buttonDisabled : {},
          ]}
          onPress={createOrder}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <Text style={styles.buttonText}>Create Order</Text>
          )}
        </AnimatedPressable>
      </View>
    </HeaderPage>
  );
}

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Filson-Bold",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 2,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
    textDecorationLine: "line-through",
    color: "#666",
  },
  sellingPrice: {
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
    color: "#333",
  },
  sectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Filson-Bold",
    marginBottom: 8,
    marginLeft: 4,
    color: "#333",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.04)",
    // padding: 4,
    borderRadius: 10,
    height: 32,
    width: 80,
    marginLeft: "auto",
    overflow: "hidden",
  },
  stepperButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    height: "100%",
  },
  stepperText: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    marginHorizontal: 8,
    flex: 1,
    textAlign: "center",
  },
  addressText: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    marginLeft: 4,
    marginBottom: 4,
    color: "#333",
  },
  addressTextDetails: {
    fontSize: 12,
    fontFamily: "General-Sans-Regular",
    color: "#666",
    marginLeft: 4,
    width: "80%",
  },
  addressButton: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  deliveryModeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    borderWidth: 2,
    borderColor: "transparent",
  },
  deliveryModeText: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    color: "black",
  },
  deliveryModeTime: {
    fontSize: 12,
    color: "#666",
    fontFamily: "General-Sans-Regular",
  },
  deliveryModeFees: {
    fontSize: 14,
    fontFamily: "Filson-Bold",
    marginLeft: "auto",
    color: "#333",
  },
  deliveryModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  deliveryModeIcon: {
    marginRight: 8,
  },
  selectedDeliveryModeItem: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "rgba(141, 20, 206, 0.04)",
  },
  deliveryModeError: {
    fontSize: 14,
    fontFamily: "General-Sans-Regular",
    color: "#666",
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 12,
    gap: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(0,0,0,0.08)",
    // paddingBottom: 10,
  },
  summaryItemLabel: {
    fontSize: 14,
    fontFamily: "Filson-Regular",
    color: "#333",
  },
  summaryItemValue: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    color: "#333",
  },
  button: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    color: "#333",
  },
  buttonContainer: {
    position: "fixed",
    top: 0,
    right: 0,
    backgroundColor: "white",
    width: Dimensions.get("window").width,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
});
