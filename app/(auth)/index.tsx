import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function LoginPhone() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const { sendOTP, authState } = useAuth();

  const handlePhoneSubmit = async (isLongPress?: boolean) => {
    try {
      // Clean and validate phone number
      const cleanedPhone = phone.trim().replace(/\D/g, "");

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        Alert.alert(
          "Error",
          `Please enter a valid 10-digit phone number. Current length: ${cleanedPhone.length}`
        );
        return;
      }

      // Add +91 prefix to phone number
      const fullPhoneNumber = `+91${cleanedPhone}`;

      // Call the API to send OTP using auth context
      const response = await sendOTP(
        fullPhoneNumber,
        isLongPress ? "ADMIN" : "SELLER"
      );
      console.log("OTP sent successfully");

      // Navigate to verify screen with phone number
      router.push({
        pathname: "/verify",
        params: {
          phone: fullPhoneNumber,
          verificationId: response.verificationId,
        },
      });
    } catch (error: any) {
      console.error("Phone submission error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  return (
    <LinearGradient colors={["#470A68", "#8D14CE"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Logo */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/unicapp-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heading}>Your Delivery Superhero</Text>
          </View>

          <View style={styles.midcontainer}>
            <Text style={styles.header}>Get started with Unicapp</Text>
            <View style={styles.inputContainer}>
              <View style={styles.textPrefixContainer}>
                <Text style={styles.textPrefix}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Enter mobile number"
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  setPhone(cleaned);
                }}
              />
            </View>

            <TouchableOpacity
              onLongPress={() => handlePhoneSubmit(true)}
              onPress={() => handlePhoneSubmit(false)}
              disabled={authState.isLoading}
              style={[
                styles.signupButton,
                authState.isLoading && styles.signupButtonDisabled,
              ]}
            >
              <Text style={styles.signup}>
                {authState.isLoading ? "Sending OTP..." : "Sign up"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.desc}>
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: "General-Sans-Regular",
    color: "white",
    fontSize: 18,
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
    height: 46,
    borderRadius: 12,
    // borderWidth: 1,
    borderColor: "#FFFFFF40",
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 16,
    backgroundColor: "white",
    overflow: "hidden",
  },
  textPrefixContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF40",
    flexDirection: "row",
  },
  textPrefix: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Filson-Bold",
  },
  input: {
    fontFamily: "General-Sans-Regular",
    flex: 1,
    height: "100%",
    color: "black",
    fontSize: 16,
    paddingHorizontal: 8,
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
    height: 227,
    backgroundColor: "#242424",
    borderRadius: 24,
    padding: 20,
  },
  signupButton: {
    marginTop: 10,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signup: {
    backgroundColor: "#F3E545",
    borderRadius: 12,
    padding: 10,
    textAlign: "center",
    fontFamily: "General-Sans-Medium",
  },
});
