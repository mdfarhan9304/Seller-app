import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from '../../../components/Header';
import { preferencesAPI } from '../../../services/api';

const PaymentSettingsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "BANK">("UPI");
  const [upiId, setUpiId] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getSellerPreferences();
      const payment = response.preferences?.paymentSettings;

      if (payment) {
        const method = payment.paymentType === 'UPI' ? 'UPI' : 'BANK';
        setPaymentMethod(method === 'UPI' ? 'UPI' : 'BANK');
        setUpiId(payment.upiId || "");
        setAccountHolderName(payment.accountHolderName || "");
        setAccountNumber(payment.accountNumber || "");
        setBankName(payment.bankName || "");
        setIfscCode(payment.ifscCode || "");
      }
    } catch (error) {
      console.error("Error loading payment settings:", error);
      Alert.alert("Error", "Failed to load payment settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      
      const paymentOptions = paymentMethod === "UPI" 
        ? {
            paymentType: "UPI" as const,
            upiId: upiId.trim(),
          }
        : {
            paymentType: "BANK" as const,
            accountHolderName: accountHolderName.trim(),
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim(),
            ifscCode: ifscCode.trim(),
          };

      await preferencesAPI.updatePaymentSettings(paymentOptions);
      await loadPaymentSettings();
      Alert.alert("Success", "Payment settings updated successfully");
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update payment settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#8D14CE', '#470A68']} style={styles.gradient}>
          <View style={styles.headerContainer}>
            <Header title="Payment Settings" showBackButton={true} />
            <View style={styles.mainContent}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8D14CE" />
                <Text style={styles.loadingText}>Loading payment settings...</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8D14CE', '#470A68']} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Header title="Payment Settings" showBackButton={true} />
          
          <View style={styles.mainContent}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Choose a payment option</Text>
          
          {/* Payment Method Selection */}
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
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, saving && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
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
  inputField: {
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#000",
    padding: 10,
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  button: {
    width: "100%",
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
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
});

export default PaymentSettingsScreen; 