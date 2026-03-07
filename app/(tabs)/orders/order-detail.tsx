import { formatDate } from "@/app/create-order/_components/ScheduleSelector";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import HeaderPage from "@/components/ui/HeaderPage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderAPI } from "../../../services/api";

const { height } = Dimensions.get("window");

type OrderStatus = "NEW" | "NOT_READY" | "READY" | "IN_TRANSIT" | "DELIVERED";

interface DeliveryInfo {
  carrier: string;
  trackingId: string;
  trackingUrl: string;
}

interface OrderData {
  id: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  orderDate: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: { uri: string };
    quantity: number;
  }[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
  deliveryInfo?: DeliveryInfo;
  pickupTime?: Date;
  orderId: string;
  status: string;
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderId = (params.orderId as string) || "ORD1234";
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    (params.status as OrderStatus) || "NEW",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const customerNameFromParams = (params.customerName as string) || "";

  useEffect(() => {
    console.log("params notification", params);
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderById(orderId);
      console.log("response", JSON.stringify(response, null, 2));
      const order = response.order;
      const transformedOrder: OrderData = {
        id: order._id,
        customerName:
          customerNameFromParams ||
          order.fullName ||
          order.deliveryAddress?.receiverName ||
          order.customerName ||
          order.customer?.fullName ||
          order.customer?.name ||
          order.deliveryAddress?.fullName ||
          order.deliveryAddress?.name,
        customerAddress: order.deliveryAddress?.displayAddress,
        customerPhone: order.deliveryAddress?.receiverPhoneNumber,
        orderDate: new Date(order.createdAt).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        product: order.products.map((product: any) => ({
          id: product?._id,
          name: product?.productName || product?.name || "Product",
          price: product?.sellingPrice || product?.originalPrice || 0,
          image: {
            uri:
              product?.images?.[0]?.url ||
              product?.images?.[0] ||
              "https://via.placeholder.com/105x114",
          },
          quantity: product?.quantity || 1,
        })),
        pricing: {
          subtotal: order.productsPrice || 0,
          deliveryFee: order.deliveryFees || 0,
          discount: order.discountAmt || 0,
          total: order.totalPrice || 0,
        },
        status: order.status,
        deliveryInfo: order.deliveryInfo,
        pickupTime: order.pickupTime,
        orderId: order.orderId,
      };

      setOrderData(transformedOrder);

      // Map API status to our status enum
      if (order.status === "CONFIRMED") {
        setOrderStatus("NEW");
      } else if (order.status === "READY_TO_SHIP") {
        setOrderStatus("READY");
      } else if (order.status === "DELIVERED") {
        setOrderStatus("DELIVERED");
      } else if (order.status === "IN_TRANSIT") {
        setOrderStatus("IN_TRANSIT");
      } else {
        // Keep the original status for other statuses
        setOrderStatus(order.status as OrderStatus);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };
  const handleScheduleOrder = () => {
    setPickerMode("date");
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Handle Android dismissal
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      setShowTimePicker(false);

      if (event.type === "dismissed") {
        return;
      }
    }

    if (selectedDate) {
      if (pickerMode === "date") {
        setScheduleDate(selectedDate);
        if (Platform.OS === "android") {
          // On Android, show time picker immediately after date selection
          setTimeout(() => {
            setShowTimePicker(true);
            setPickerMode("time");
          }, 100);
        } else {
          // On iOS, time picker is shown in modal
          // Don't close date picker here, it's handled in modal
        }
      } else if (pickerMode === "time") {
        // Combine date and time
        const combinedDate = new Date(scheduleDate);
        combinedDate.setHours(selectedDate.getHours());
        combinedDate.setMinutes(selectedDate.getMinutes());
        setScheduleDate(combinedDate);

        if (Platform.OS === "android") {
          setShowTimePicker(false);
          // Schedule the order with selected date/time
          scheduleOrderWithDate(combinedDate);
        }
        // iOS handles this in the Done button
      }
    }
  };

  const scheduleOrderWithDate = async (scheduledDate: Date) => {
    try {
      setIsLoading(true);
      // Format date for API (ISO string)
      const scheduledFor = scheduledDate.toISOString();

      // TODO: Add schedule API endpoint when available
      // For now, you can use updateOrderStatus or add a new schedule endpoint
      // await orderAPI.scheduleOrder(orderId, scheduledFor);

      Alert.alert(
        "Order Scheduled",
        `Order scheduled for ${scheduledDate.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh order details
              fetchOrderDetails();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Error scheduling order:", error);
      Alert.alert("Error", "Failed to schedule order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReady = async () => {
    Alert.alert(
      "Mark as Ready",
      "Are you sure you want to mark this order as ready to deliver?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setIsLoading(true);
              // API call to mark as ready to ship
              await orderAPI.updateOrderStatus(orderId, "READY_TO_SHIP");
              setOrderStatus("READY");
              Alert.alert("Success", "Order marked as ready for delivery");
              // Refresh order details to get updated status
              await fetchOrderDetails();
            } catch (error: any) {
              console.error("Error marking order as ready:", error);
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update order status";
              Alert.alert("Error", errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleShareTracking = () => {
    if (!orderData?.deliveryInfo) return;

    const formattedOrderId = orderData.orderId
      ? orderData.orderId
      : orderId.startsWith("ORD-")
        ? orderId
        : `ORD-${orderId.slice(-6).toUpperCase()}`;
    const messageCOmponents = [
      `Your order ${formattedOrderId} is on its way!`,
      orderData.deliveryInfo.carrier
        ? `Carrier: ${orderData.deliveryInfo.carrier}`
        : null,
      orderData.deliveryInfo.trackingId
        ? `Tracking ID: ${orderData.deliveryInfo.trackingId}`
        : null,
      orderData.deliveryInfo.trackingUrl
        ? `Track here: ${orderData.deliveryInfo.trackingUrl}`
        : null,
    ].filter(Boolean);
    const message = messageCOmponents.filter(Boolean).join("\n\n");

    Alert.alert(
      "Share Tracking Details",
      "Share tracking information with customer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            // In real app, use Share API or send via SMS/WhatsApp
            const whatsappUrl = `https://wa.me/91${orderData.customerPhone
              .replace(/\D/g, "")
              .slice(-10)}?text=${encodeURIComponent(message)}`;
            Linking.openURL(whatsappUrl).catch((err) => {
              console.error("Failed to open WhatsApp:", err);
              Alert.alert("Error", "Failed to open WhatsApp");
            });
            Alert.alert("Shared", "Tracking details shared with customer");
          },
        },
      ],
    );
  };

  const handleOpenTracking = () => {
    if (!orderData?.deliveryInfo) return;

    const url = `https://${orderData.deliveryInfo.trackingUrl}`;
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Failed to open tracking link");
    });
  };

  const renderStatusBadges = () => {
    const currentStatus = orderData?.status || "";

    if (currentStatus === "CONFIRMED" || orderStatus === "NEW") {
      return (
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusBadge, styles.statusNew]}>
            <Text style={styles.statusText}>New</Text>
          </View>
          <View style={[styles.statusBadge, styles.statusNotReady]}>
            <Ionicons name="hourglass-outline" size={13} color="#FECE32" />
            <Text style={[styles.statusText, styles.statusNotReadyText]}>
              {" "}
              Not Ready
            </Text>
          </View>
        </View>
      );
    }

    // For READY_TO_SHIP and other statuses, show the actual status
    const getStatusDisplay = () => {
      if (currentStatus === "READY_TO_SHIP") return "Ready to Ship";
      if (currentStatus === "IN_TRANSIT") return "In Transit";
      if (currentStatus === "DELIVERED") return "Delivered";
      return currentStatus;
    };

    const getStatusStyle = () => {
      if (currentStatus === "READY_TO_SHIP") return styles.statusReady;
      if (currentStatus === "IN_TRANSIT") return styles.statusInTransit;
      if (currentStatus === "DELIVERED") return styles.statusDelivered;
      return styles.statusNew;
    };

    return (
      <View style={styles.statusBadgeContainer}>
        <View style={[styles.statusBadge, getStatusStyle()]}>
          <Text style={styles.statusText}>{getStatusDisplay()}</Text>
        </View>
      </View>
    );
  };

  const renderActionButton = () => {
    // Show button only for CONFIRMED/NEW orders, not for READY_TO_SHIP or other statuses
    const currentStatus = orderData?.status || "";
    if (
      currentStatus === "CONFIRMED" ||
      orderStatus === "NEW" ||
      orderStatus === "NOT_READY"
    ) {
      return (
        <TouchableOpacity
          style={styles.readyButton}
          onPress={handleMarkAsReady}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.readyButtonText}>
              ✅ Mark as Ready to deliver
            </Text>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderDeliveryInfo = () => {
    if (orderData?.deliveryInfo?.carrier) {
      return (
        <View style={styles.deliveryInfoContainer}>
          <View style={styles.deliveryInfoLeft}>
            <View style={styles.deliveryHeader}>
              <MaterialCommunityIcons
                name="truck-outline"
                size={22}
                color="#000"
              />
              <Text style={styles.deliveryTitle}>DELIVERY INFORMATION</Text>
            </View>

            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Carrier</Text>
              <Text style={styles.deliveryValue}>
                {orderData.deliveryInfo.carrier}
              </Text>
            </View>

            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Tracking number/ID</Text>
              <Text style={styles.deliveryValue}>
                {orderData.deliveryInfo.trackingId}
              </Text>
            </View>

            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Track here:</Text>
              <TouchableOpacity onPress={handleOpenTracking}>
                <Text style={[styles.deliveryValue, styles.deliveryLink]}>
                  {orderData.deliveryInfo.trackingUrl}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.deliveryInfoRight}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareTracking}
            >
              <Ionicons name="share-social-outline" size={24} color="#8D14CE" />
            </TouchableOpacity>
            <Text style={styles.shareText}>
              You can share the details with your customer
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const dowloadInvoice = async () => {
    try {
      await orderAPI.downloadInvoice(orderId);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      Alert.alert("Error", "Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8D14CE" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  console.log(orderData?.product);

  return (
    <HeaderPage
      title={
        orderData.orderId
          ? orderData.orderId
          : `ORD-${orderData.id.slice(-6).toUpperCase()}`
      }
      onBackPress={() => {
        if (params.notification) {
          router.dismissTo("/(tabs)/orders");
        } else {
          router.back();
        }
      }}
    >
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Card */}
          {orderData?.product.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{ uri: product.image.uri }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  ₹{product.price.toLocaleString()}
                </Text>
                <Text style={styles.orderDate}>{orderData.orderDate}</Text>
                {renderStatusBadges()}
              </View>
            </View>
          ))}
          {/* <View style={styles.productCard}>
          <Image source={orderData.product.image} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{orderData.product.name}</Text>
            <Text style={styles.productPrice}>₹{orderData.product.price.toLocaleString()}</Text>
            
            </View>
        </View> */}

          {/* Pricing Summary */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Products Price</Text>
              <Text style={styles.pricingValue}>
                ₹{orderData.pricing.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Delivery Fee</Text>
              <Text style={styles.pricingValue}>
                ₹{orderData.pricing.deliveryFee.toLocaleString()}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Discount Applied</Text>
              <Text style={styles.pricingValue}>
                ₹{orderData.pricing.discount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabelBold}>Total</Text>
              <Text style={styles.pricingValueBold}>
                ₹{orderData.pricing.total.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Customer Details */}
          <View style={styles.customerCard}>
            <View style={styles.customerContent}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerLabel}>Customer Details</Text>
                <Text style={styles.customerName}>
                  {orderData.customerName}
                </Text>
                <Text style={styles.customerAddress}>
                  {orderData.customerAddress}
                </Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.customerActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    Linking.openURL(
                      `tel:91${orderData.customerPhone
                        .replace(/\D/g, "")
                        .slice(-10)}`,
                    )
                  }
                >
                  <Ionicons name="call-outline" size={18} color="#8D14CE" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://wa.me/91${orderData.customerPhone
                        .replace(/\D/g, "")
                        .slice(-10)}`,
                    )
                  }
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#8D14CE" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Delivery Information (for In Transit / Delivered) */}
          {renderDeliveryInfo()}

          {/* Action Button (for New / Not Ready) */}
          {renderActionButton()}

          <AnimatedPressable
            style={styles.downloadInvoiceButton}
            onPress={dowloadInvoice}
          >
            <Ionicons name="download-outline" size={24} color="#8D14CE" />
            <Text style={styles.downloadInvoiceText}>Download Invoice</Text>
          </AnimatedPressable>

          {/* Schedule Section (for New orders) */}
          {(orderStatus === "NEW" || orderStatus === "NOT_READY") &&
            !orderData?.pickupTime && (
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={handleScheduleOrder}
                disabled={isLoading}
              >
                <Text style={styles.scheduleText}>
                  {scheduleDate && scheduleDate > new Date()
                    ? `Scheduled: ${scheduleDate.toLocaleString("en-US", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : "Schedule"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#000" />
              </TouchableOpacity>
            )}
          {orderData?.pickupTime && (
            <View style={styles.scheduleButton}>
              <Text style={styles.scheduleText}>
                Pickup Time: {formatDate(new Date(orderData.pickupTime))}
              </Text>
            </View>
          )}
          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={scheduleDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={scheduleDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              is24Hour={false}
            />
          )}

          {/* iOS Picker Modal Controls */}
          {Platform.OS === "ios" && (showDatePicker || showTimePicker) && (
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={styles.pickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>
                    {pickerMode === "date" ? "Select Date" : "Select Time"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (pickerMode === "date") {
                        setShowDatePicker(false);
                        setShowTimePicker(true);
                        setPickerMode("time");
                      } else {
                        setShowTimePicker(false);
                        scheduleOrderWithDate(scheduleDate);
                      }
                    }}
                  >
                    <Text style={styles.pickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePickerIOS"
                    value={scheduleDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setScheduleDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    testID="timePickerIOS"
                    value={scheduleDate}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        const combinedDate = new Date(scheduleDate);
                        combinedDate.setHours(selectedDate.getHours());
                        combinedDate.setMinutes(selectedDate.getMinutes());
                        setScheduleDate(combinedDate);
                      }
                    }}
                    is24Hour={false}
                  />
                )}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </HeaderPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    // paddingTop: 20,
  },
  mainContent: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    // position: "absolute",
    // top: height * 0.14,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  productImage: {
    width: 105,
    height: 114,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  productInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  productPrice: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(0, 0, 0, 0.75)",
  },
  orderDate: {
    fontFamily: "General Sans",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(0, 0, 0, 0.5)",
  },
  statusBadgeContainer: {
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 3,
  },
  statusNew: {
    borderColor: "#FECE32",
    backgroundColor: "transparent",
  },
  statusNotReady: {
    borderColor: "#FECE32",
    backgroundColor: "transparent",
    opacity: 0.5,
  },
  statusNotReadyText: {
    color: "#FECE32",
  },
  statusReady: {
    borderColor: "#FECE32",
    backgroundColor: "transparent",
  },
  statusInTransit: {
    borderColor: "#000",
    backgroundColor: "transparent",
  },
  statusDelivered: {
    borderColor: "#000",
    backgroundColor: "transparent",
  },
  statusText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 8,
    lineHeight: 11,
    color: "#000",
  },
  pricingCard: {
    backgroundColor: "rgba(255, 224, 127, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  pricingLabel: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(0, 0, 0, 0.5)",
  },
  pricingValue: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "right",
  },
  pricingLabelBold: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  pricingValueBold: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
    textAlign: "right",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#cfb774",
    opacity: 0.2,
    marginVertical: 5,
  },
  customerCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  customerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  customerInfo: {
    flex: 1,
    paddingRight: 16,
  },
  customerLabel: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 4,
  },
  customerName: {
    fontFamily: "General Sans",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  customerAddress: {
    fontFamily: "General Sans",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(0, 0, 0, 0.75)",
    marginTop: 8,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignSelf: "stretch",
    marginHorizontal: 8,
  },
  customerActions: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
    marginVertical: "auto",
    gap: 12,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(141, 38, 202, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadInvoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "auto",
    gap: 8,
  },
  downloadInvoiceText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#8D14CE",
  },
  deliveryInfoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  deliveryInfoLeft: {
    flex: 1,
    paddingRight: 16,
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  deliveryTitle: {
    fontFamily: "General-Sans-Medium",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 23,
    color: "#030303",
  },
  deliveryRow: {
    marginBottom: 8,
  },
  deliveryLabel: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 23,
    color: "#8E8E8E",
    marginBottom: 2,
  },
  deliveryValue: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 23,
    color: "rgba(0, 0, 0, 0.75)",
  },
  deliveryLink: {
    textDecorationLine: "underline",
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    marginHorizontal: 8,
  },
  deliveryInfoRight: {
    width: 103,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(141, 38, 202, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shareText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 8,
    lineHeight: 11,
    color: "#8E8E8E",
    textAlign: "center",
  },
  readyButton: {
    backgroundColor: "rgba(243, 229, 69, 0.75)",
    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
    height: 60,
    shadowColor: "#000",
    marginBottom: 16,
  },
  readyButtonText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 37,
    color: "#000",
  },
  scheduleButton: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  scheduleText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 37,
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  loadingText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    color: "#8D14CE",
  },
  pickerModalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  pickerTitle: {
    fontFamily: "General Sans",
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  pickerCancelText: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 16,
    color: "#8D14CE",
  },
  pickerDoneText: {
    fontFamily: "General Sans",
    fontWeight: "600",
    fontSize: 16,
    color: "#8D14CE",
  },
});
