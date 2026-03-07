import api from "@/services/api";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Header from "../../../components/Header";
const { width, height } = Dimensions.get("window");

export default function GetEstimateScreen() {
  const router = useRouter();
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [height, setHeight] = useState("");
  const [useCm, setUseCm] = useState(true);
  const [weightUnit, setWeightUnit] = useState("kg"); // 'kg' or 'gm'
  const [serviceType, setServiceType] = useState("standard"); // 'standard' or 'courier'
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [priceCalculated, setPriceCalculated] = useState(false);
  const [pricingData, setPricingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const resetPricing = () => {
    setPriceCalculated(false);
    setPricingData(null);
    setErrorMessage(null);
  };
  const handleFromAddressChange = (value: string) => {
    setFromAddress(value);
    resetPricing();
  };
  
  const handleToAddressChange = (value: string) => {
    setToAddress(value);
    resetPricing();
  };
  
  const handleWeightChange = (value: string) => {
    setWeight(value);
    resetPricing();
  };
  
  const handleDimensionChange =
    (setter: (text: string) => void) => (value: string) => {
      setter(value);
      resetPricing();
    };

  const handleCalculate = async () => {
    // Validate pincode format
    const pincodeRegex = /^\d{6}$/;
    
    if (!fromAddress.trim() || !toAddress.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter pickup and delivery pincodes."
      );
      return;
    }

    if (!pincodeRegex.test(fromAddress.trim())) {
      Alert.alert(
        "Invalid Pincode",
        "Pickup pincode must be 6 digits."
      );
      return;
    }

    if (!pincodeRegex.test(toAddress.trim())) {
      Alert.alert(
        "Invalid Pincode",
        "Delivery pincode must be 6 digits."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setPricingData(null);

    const payload: any = {
      pickupPincode: fromAddress.trim(),
      dropoffPincode: toAddress.trim(),
      serviceType: serviceType === "courier" ? "courier" : "standard",
      weight: parseFloat(weight || "0") || 0,
      weightUnit,
      isScheduled: false,
      useCm,
    };

    if (serviceType === "courier") {
      payload.length = parseFloat(length || "0") || 0;
      payload.breadth = parseFloat(breadth || "0") || 0;
      payload.height = parseFloat(height || "0") || 0;
    }

    try {
      const response = await api.post("/store/calculatePrice", payload);
      setPricingData(response.data);
      setPriceCalculated(true);
      Keyboard.dismiss();
    } catch (error: any) {
      console.log("Price calculation error", error?.response || error);
      const message =
        error?.response?.data?.message ||
        "Unable to calculate price right now.";
      setErrorMessage(message);
      setPriceCalculated(false);
      Alert.alert("Calculation failed", message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeightUnit = (unit: "kg" | "gm") => {
    setWeightUnit(unit);
    resetPricing();
  };

  const toggleServiceType = (type: "standard" | "courier") => {
    setServiceType(type);
    resetPricing();
  };

  const handleWhatsAppShare = () => {
    if (!pricingData?.pricing) {
      return;
    }
    const price =
      pricingData.pricing.finalPrice ?? pricingData.pricing.subtotal;
    const message = `Pickup: ${fromAddress}\nDropoff: ${toAddress}\nService: ${
      serviceType === "courier" ? "Courier" : "Intracity"
    }\nDistance: ${pricingData.distance || 0} km\nEstimated Price: ₹${price}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "WhatsApp not available",
        "Please install WhatsApp to share this quote."
      );
    });
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#470A68", "#8D14CE"]} style={styles.gradient}>
        <View style={styles.content}>
          <Header title="Get an estimate" onBack={handleBack} />

          {/* Main Content */}
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView
              style={styles.keyboardAvoidContainer}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
              <View style={styles.mainContent}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Service Type Selector */}
                  <View style={styles.serviceTypeSection}>
                    <View style={styles.serviceTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.serviceTypeOption,
                          serviceType === "standard"
                            ? styles.activeServiceOption
                            : styles.inactiveServiceOption,
                        ]}
                        onPress={() => toggleServiceType("standard")}
                      >
                        <Text
                          style={
                            serviceType === "standard"
                              ? styles.activeServiceText
                              : styles.inactiveServiceText
                          }
                        >
                          Intracity
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.serviceTypeOption,
                          serviceType === "courier"
                            ? styles.activeServiceOption
                            : styles.inactiveServiceOption,
                        ]}
                        onPress={() => toggleServiceType("courier")}
                      >
                        <Text
                          style={
                            serviceType === "courier"
                              ? styles.activeServiceText
                              : styles.inactiveServiceText
                          }
                        >
                          Courier
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Address Details Section */}
                  <Text style={styles.sectionTitle}>Enter Address Details</Text>

                  <View style={styles.addressContainer}>
                    {/* From Address */}
                    <View style={styles.addressField}>
                      <View style={styles.addressMarker}>
                        <View style={styles.greenCircle}>
                          <View style={styles.whiteCircle} />
                        </View>
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit pickup pincode"
                        placeholderTextColor="rgba(0, 0, 0, 0.5)"
                        value={fromAddress}
                        onChangeText={handleFromAddressChange}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>

                    {/* Connecting Line */}
                    <View style={styles.connectingLine} />

                    {/* To Address */}
                    <View style={styles.addressField}>
                      <View style={styles.addressMarker}>
                        <View style={styles.redCircle}>
                          <View style={styles.whiteCircle} />
                        </View>
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit delivery pincode"
                        placeholderTextColor="rgba(0, 0, 0, 0.5)"
                        value={toAddress}
                        onChangeText={handleToAddressChange}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  {/* Weight Section */}
                  <View style={styles.weightSection}>
                    <Text style={styles.fieldLabel}>Approx. weight</Text>
                    <View style={styles.weightInputContainer}>
                      <TextInput
                        style={styles.weightInput}
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={handleWeightChange}
                        placeholder="0.00"
                        placeholderTextColor="rgba(0, 0, 0, 0.5)"
                      />
                      <View style={styles.unitSelectorContainer}>
                        <TouchableOpacity
                          style={[
                            styles.unitOption,
                            weightUnit === "kg"
                              ? styles.activeUnitOption
                              : styles.inactiveUnitOption,
                          ]}
                          
                          onPress={() => toggleWeightUnit("kg")}
                        >
                          <Text
                            style={
                              weightUnit === "kg"
                                ? styles.activeUnitText
                                : styles.inactiveUnitText
                            }
                          >
                            kg
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.unitOption,
                            weightUnit === "gm"
                              ? styles.activeUnitOption
                              : styles.inactiveUnitOption,
                          ]}
                          onPress={() => toggleWeightUnit("gm")}
                        >
                          <Text
                            style={
                              weightUnit === "gm"
                                ? styles.activeUnitText
                                : styles.inactiveUnitText
                            }
                          >
                            gm
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Dimensions Section - Only show for courier service type */}
                  {serviceType === "courier" && (
                    <View style={styles.dimensionsSection}>
                      <Text style={styles.fieldLabel}>
                        Dimensions (Length x Breadth x Height)
                      </Text>
                      <View style={styles.dimensionsContainer}>
                        <View style={styles.dimensionInputContainer}>
                          <TextInput
                            style={styles.dimensionInput}
                            keyboardType="numeric"
                            placeholder="L"
                            placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={length}
                    onChangeText={handleDimensionChange(setLength)}
                          />
                        </View>
                        <View style={styles.dimensionInputContainer}>
                          <TextInput
                            style={styles.dimensionInput}
                            keyboardType="numeric"
                            placeholder="B"
                            placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={breadth}
                    onChangeText={handleDimensionChange(setBreadth)}
                          />
                        </View>
                        <View style={styles.dimensionInputContainer}>
                          <TextInput
                            style={styles.dimensionInput}
                            keyboardType="numeric"
                            placeholder="H"
                            placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={height}
                    onChangeText={handleDimensionChange(setHeight)}
                          />
                        </View>
                        <View style={styles.dimensionUnitSelector}>
                          <TouchableOpacity
                            style={[
                              styles.dimensionUnitOption,
                              useCm
                                ? styles.activeDimensionUnit
                                : styles.inactiveDimensionUnit,
                            ]}
                            onPress={() => {
                              setUseCm(true);
                              resetPricing();
                            }}
                          >
                            <Text
                              style={
                                useCm
                                  ? styles.activeDimensionUnitText
                                  : styles.inactiveDimensionUnitText
                              }
                            >
                              cm
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.dimensionUnitOption,
                              !useCm
                                ? styles.activeDimensionUnit
                                : styles.inactiveDimensionUnit,
                            ]}
                            onPress={() => {
                              setUseCm(false);
                              resetPricing();
                            }}
                          >
                            <Text
                              style={
                                !useCm
                                  ? styles.activeDimensionUnitText
                                  : styles.inactiveDimensionUnitText
                              }
                            >
                              inch
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Pricing Section - Only show when calculated */}
                  {priceCalculated && <View style={styles.priceDivider} />}
                  {priceCalculated && pricingData?.pricing && (
                    <View style={styles.pricingSection}>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text style={styles.deliveryFeeTitle}>
                          Delivery Fee
                        </Text>
                        <Text style={styles.deliveryFeeAmount}>
                          ₹
                          {pricingData.pricing.finalPrice?.toFixed(2) ??
                            pricingData.pricing.subtotal?.toFixed(2)}
                        </Text>
                      </View>

                      {pricingData.distance && (
                        <View style={styles.taxRow}>
                          <Text style={styles.taxLabel}>Distance</Text>
                          <Text style={styles.taxAmount}>
                            {pricingData.distance} km
                          </Text>
                        </View>
                      )}

                      {pricingData.pricing.breakdown && (
                        <View style={styles.taxDetailsCard}>
                          {Object.entries(pricingData.pricing.breakdown)
                            .filter(([, value]) => !!value)
                            .map(([key, value]: any, index) => (
                              <View
                                key={`${key}-${index}`}
                                style={styles.breakdownRow}
                              >
                                <Text style={styles.taxLabel}>
                                  {value.description}
                                </Text>
                                <Text style={styles.taxAmount}>
                                  {value.amount !== undefined
                                    ? `₹${value.amount?.toFixed(2)}`
                                    : value.rate !== undefined
                                    ? `${value.rate}${
                                        value.unit ? `/${value.unit}` : ""
                                      }`
                                    : ""}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}

                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                          ₹
                          {pricingData.pricing.finalPrice?.toFixed(2) ??
                            pricingData.pricing.subtotal?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  )}
                </ScrollView>

                {/* Calculate Button - Fixed at bottom */}
                <View
                  style={[
                    styles.bottomButtonContainer,
                    Platform.OS === "ios" &&
                      isKeyboardVisible &&
                      styles.buttonWithKeyboard,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.calculateButton,
                      loading && { opacity: 0.7 },
                    ]}
                    onPress={
                      pricingData?.pricing
                        ? handleWhatsAppShare
                        : handleCalculate
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.calculateButtonText}>
                        {pricingData?.pricing ? "Add Unicapp it" : "Calculate"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </LinearGradient>
    </View>
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
    paddingTop: 20,
  },
  keyboardAvoidContainer: {
    flex: 1,
    position: "relative",
  },
  mainContent: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 25,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.75)",
    fontFamily: "General-Sans-Medium",
    marginBottom: 12,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addressMarker: {
    marginRight: 10,
  },
  greenCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B17D",
    justifyContent: "center",
    alignItems: "center",
  },
  redCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  whiteCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  connectingLine: {
    width: 4,
    height: 25,
    backgroundColor: "#F3E545",
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceTypeSection: {
    marginBottom: 20,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    borderRadius: 9,
    overflow: "hidden",
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    padding: 2,
  },
  serviceTypeOption: {
    flex: 1,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },
  activeServiceOption: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  inactiveServiceOption: {
    backgroundColor: "transparent",
  },
  activeServiceText: {
    color: "#000000",
    fontFamily: "General-Sans-Medium",
    fontSize: 13,
    fontWeight: "600",
  },
  inactiveServiceText: {
    color: "#000000",
    fontFamily: "General-Sans-Medium",
    fontSize: 13,
    fontWeight: "400",
  },
  weightSection: {
    marginBottom: 20,
    marginTop: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
    color: "rgba(0, 0, 0, 0.75)",
    marginBottom: 8,
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },
  weightInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  unitSelectorContainer: {
    flexDirection: "row",
    height: 50,
    width: 100,
    marginLeft: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  unitOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeUnitOption: {
    backgroundColor: "#470A68",
  },
  inactiveUnitOption: {
    backgroundColor: "#FFFFFF",
  },
  activeUnitText: {
    color: "#FFFFFF",
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
  },
  inactiveUnitText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
  },
  dimensionsSection: {
    marginBottom: 20,
  },
  dimensionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dimensionInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  dimensionInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dimensionUnitSelector: {
    width: 100,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    backgroundColor: "#FFFFFF",
  },
  dimensionUnitOption: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDimensionUnit: {
    backgroundColor: "#470A68",
  },
  inactiveDimensionUnit: {
    backgroundColor: "#FFFFFF",
  },
  activeDimensionUnitText: {
    color: "#FFFFFF",
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
  },
  inactiveDimensionUnitText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
  },
  // Pricing section styles
  pricingSection: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryFeeTitle: {
    fontFamily: "General-Sans-Medium",
    color: "#000000",
    fontSize: 15,
    marginBottom: 4,
  },
  deliveryFeeAmount: {
    fontFamily: "General-Sans-Medium",
    fontWeight: "600",
    fontSize: 20,
    color: "#000000",
    marginBottom: 15,
  },
  taxDetailsCard: {
    backgroundColor: "rgba(255, 224, 127, 0.2)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  taxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  taxLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.5)",
  },
  taxAmount: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.5)",
  },
  taxDivider: {
    height: 1,
    backgroundColor: "#FFF1CA",
    marginVertical: 8,
  },
  priceDivider: {
    height: 0.5,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "#000000",
  },
  totalAmount: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "#000000",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
  },
  buttonWithKeyboard: {
    position: "absolute",
    bottom: 0,
    marginTop: 0,
  },
  calculateButton: {
    height: 56,
    backgroundColor: "#F3E545",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  calculateButtonText: {
    color: "#000",
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 10,
    color: "#EF4444",
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
  },
});
