import HeaderPage from "@/components/ui/HeaderPage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  BankPaymentOptions,
  PaymentOptions,
  UPIPaymentOptions,
} from "../../services/api";

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  gradient: {
    flex: 1,
  },
  header: {
    marginTop: 50,
    paddingBottom: 20,
    marginLeft: 20,
    fontFamily: "Filson-Bold",
    color: "white",
    fontSize: 20,
  },
  mainContent: {
    backgroundColor: "#f5f5f5",
    // height: height,
    // position: "absolute",
    // top: height * 0.12,
    width: "100%",
    padding: 20,
  },
  title: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  helpText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
    marginTop: 4,
    marginBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  optionContainer: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0094B2",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0094B2",
  },
  inputContainer: {
    width: "100%",
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 5,
  },
  inputField: {
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    padding: 8,
    color: "#000",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "90%",
    backgroundColor: "#F3E545",
    paddingVertical: 15,
    borderRadius: 8,
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
  buttonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
  },
});

const UPIPayment = () => {
  const router = useRouter();
  const { updateRegistrationData, authState, registerSeller } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "BANK">("UPI");
  const [upiId, setUpiId] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");

  const validateForm = () => {
    if (paymentMethod === "UPI") {
      if (!upiId.trim()) {
        Alert.alert("Error", "Please enter your UPI ID");
        return false;
      }
    } else {
      if (!accountHolderName.trim()) {
        Alert.alert("Error", "Please enter account holder name");
        return false;
      }
      if (!accountNumber.trim()) {
        Alert.alert("Error", "Please enter account number");
        return false;
      }
      if (!bankName.trim()) {
        Alert.alert("Error", "Please enter bank name");
        return false;
      }
      if (!ifscCode.trim()) {
        Alert.alert("Error", "Please enter IFSC code");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const paymentData: PaymentOptions =
        paymentMethod === "UPI"
          ? {
              paymentType: "UPI",
              upiId: upiId,
            }
          : {
              paymentType: "BANK",
              accountHolderName,
              accountNumber,
              bankName,
              ifscCode,
            };

      // Log all registration data before submission
      console.log("=== Registration Data Summary ===");
      console.log("Business Information:");
      console.log("- Business Name:", authState.registrationData.businessName);
      console.log("- Email:", authState.registrationData.email);
      console.log("- subdomain:", authState.registrationData.subdomain);
      console.log("- Bio:", authState.registrationData.bio);
      console.log("- Instagram:", authState.registrationData.instagramHandle);

      console.log("\nLocation Information:");
      console.log("- Floor:", authState.registrationData.sellerLocation?.floor);
      console.log(
        "- Building:",
        authState.registrationData.sellerLocation?.buildingName
      );
      console.log(
        "- Landmark:",
        authState.registrationData.sellerLocation?.landmark
      );
      console.log(
        "- Address:",
        authState.registrationData.sellerLocation?.address
      );
      console.log("- Coordinates:", {
        lat: authState.registrationData.sellerLocation?.latitude,
        lng: authState.registrationData.sellerLocation?.longitude,
      });

      console.log("\nPayment Information:");
      if (paymentData.paymentType === "UPI") {
        console.log("- Payment Type: UPI");
        console.log("- UPI ID:", (paymentData as UPIPaymentOptions).upiId);
      } else {
        console.log("- Payment Type: Bank Transfer");
        const bankData = paymentData as BankPaymentOptions;
        console.log("- Account Holder:", bankData.accountHolderName);
        console.log("- Account Number:", bankData.accountNumber);
        console.log("- Bank Name:", bankData.bankName);
        console.log("- IFSC Code:", bankData.ifscCode);
      }
      console.log("==============================");

      // Call the registration API with payment data
      const registrationResponse = await registerSeller(paymentData);
      console.log("registrationResponse", registrationResponse);

      // Save seller data to AsyncStorage
      const seller =
        registrationResponse?.seller || registrationResponse?.user?.seller;
      if (seller) {
        await AsyncStorage.setItem("seller_data", JSON.stringify(seller));
      }

      Alert.alert("Success", "Registration successful! Welcome to Unicapp.");

      // Direct registration - go straight to home
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert(
        "Error",
        "Failed to complete registration. Please try again."
      );
    }
  };

  return (
    <HeaderPage title="Payment Details">
      <View style={styles.mainContent}>
        <Text style={styles.title}>Choose a payment option</Text>

        {/* UPI Option */}
        <View style={styles.option}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setPaymentMethod("UPI")}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === "UPI" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>By UPI</Text>
          </TouchableOpacity>

          {/* Bank Option */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setPaymentMethod("BANK")}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === "BANK" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>To Bank</Text>
          </TouchableOpacity>
        </View>
        {/* UPI Input Fields */}
        {paymentMethod === "UPI" && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="Enter your UPI ID"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Bank Account Input Fields */}
        {paymentMethod === "BANK" && (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Account Holder Name"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Bank A/c Number"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Bank Name"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={ifscCode}
                onChangeText={setIfscCode}
                placeholder="IFSC Code"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                autoCapitalize="characters"
              />
            </View>
          </>
        )}
      </View>

      {/* Next Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </HeaderPage>
  );
};

export default UPIPayment;
