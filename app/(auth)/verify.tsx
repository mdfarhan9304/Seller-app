import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

type VerifyScreenParams = {
  phone: string;
  verificationId: string;
};

export default function VerifyScreen() {
  const params = useLocalSearchParams<VerifyScreenParams>();
  const phone = params.phone;
  const verificationId = params.verificationId;
  const router = useRouter();
  const { verifyOTP: verifyOTPFromContext, sendOTP } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null!);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer, canResend]);

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await sendOTP(phone, 'SELLER');
      setTimer(30);
      setCanResend(false);
      Alert.alert("Success", "OTP sent successfully!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTPFromContext(phone, otp, verificationId);
      console.log("Verification successful:", response);
      
      // Check if user actually has store/seller data (not just isRegistered flag)
      // The API might return isRegistered: true even without store data
      const store = (response as any).store;
      const seller = (response as any).seller || (response as any).sellerInfo;
      const sellerPreferences = (response as any).sellerPreferences;
      const user = response.user;
      
     
      const hasStoreData = store && (store.name || store.subdomain || store._id);
      const hasSellerData = seller && (seller.businessName || seller._id || seller.email);
      const isActuallyRegistered = hasStoreData || hasSellerData;
      
      console.log("Navigation check:", { 
        hasUser: !!user,
        hasStore: !!store,
        hasStoreData: hasStoreData,
        hasSeller: !!seller,
        hasSellerData: hasSellerData,
        hasSellerPreferences: !!sellerPreferences,
        isActuallyRegistered: isActuallyRegistered,
        isRegisteredFlag: (response as any).isRegistered
      });
      
      // Navigate based on actual data, not just the flag
      if (user && isActuallyRegistered) {
        // User has store/seller data - they're registered, go to home
        console.log("User has store/seller data, navigating to home");
        router.replace("/(tabs)/home");
      } else if (user) {
        // User exists but no store/seller data - go to onboard to complete registration
        console.log("User exists but no store/seller data, navigating to onboard");
        router.replace("/(auth)/onboard");
      } else {
        // No user data - should not happen, but go to onboard as fallback
        console.log("No user data in response, navigating to onboard");
        router.replace("/(auth)/onboard");
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to verify OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#470A68", "#8D14CE"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.mainContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/unicapp-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heading}>We're here to deliver.</Text>
          </View>

          <View style={styles.midcontainer}>
            <Text style={styles.header}>OTP has been sent to this number</Text>
            <View style={styles.numb}>
              <Text style={styles.phoneNumber}>{phone}</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.editNumber}>Edit Number</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            <View style={styles.btncontainer}>
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={!canResend || loading}
                style={[styles.btnWrapper, (!canResend || loading) && styles.disabledButton]}
              >
                <Text style={styles.btn}>
                  {canResend ? 'Resend OTP' : `Wait ${timer}s`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleVerifyOTP}
                disabled={loading}
                style={[styles.btnWrapper, loading && styles.disabledButton]}
              >
                <Text style={styles.btn2}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  phoneNumber: {
    color: "white",
    fontSize: 16,
    fontFamily: "General-Sans-Regular",
  },
  editNumber: {
    color: "#5390F4",
    fontSize: 12,
    fontFamily: "General-Sans-Regular",
  },
  btnWrapper: {
    flex: 1,
    maxWidth: 130,
  },
  disabledButton: {
    opacity: 0.5,
  },
  btn: {
    width: 130,
    backgroundColor: "#F5F5F580",
    borderRadius: 12,
    padding: 10,
    color: "white",
    textAlign: "center",
    fontFamily: "General-Sans-Medium",
  },
  numb: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -10,
    marginBottom: 10,
  },
  btn2: {
    width: 130,
    backgroundColor: "#F3E545",
    borderRadius: 12,
    padding: 10,
    textAlign: "center",

    fontFamily: "General-Sans-Medium",
  },
  btncontainer: {
    display: "flex",
    flexDirection: "row",
    gap: 1,
    justifyContent: "space-between",
    marginTop: 15,
  },
  header: {
    fontFamily: "General-Sans-Regular",
    color: "white",
    fontSize: 12,
    marginBottom: 20,
    fontWeight: "100",
  },
  desc: {
    fontFamily: "General-Sans-Regular",
    color: "white",
    fontSize: 10,
    marginVertical: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: "20",

    display: "flex",
    flexDirection: "row",
  },
  logo: {
    width: 100,
    height: 100,
  },
  heading: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "General-Sans-Regular",
  },
  form: {
    width: "100%",
    gap: 16,
  },
  inputContainer: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF40",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  input: {
    fontFamily: "General-Sans-Regular",
    flex: 1,
    height: "100%",
    color: "black",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#470A68",
  },
  registerContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  registerLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  midcontainer: {
    width: 334,
    height: 190,
    backgroundColor: "#242424",
    borderRadius: 24,
    padding: 20,
  },
  signup: {
    backgroundColor: "#F3E545",
    borderRadius: 12,
    padding: 10,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "General-Sans-Medium",
  },
});
