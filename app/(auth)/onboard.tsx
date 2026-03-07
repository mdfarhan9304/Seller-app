import HeaderPage from "@/components/ui/HeaderPage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const styles = StyleSheet.create({
  mainbox: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerText: {
    fontFamily: "Filson-Bold",
    color: "white",
    fontSize: 22,
    marginLeft: 12,
  },

  container: {
    backgroundColor: "white",
    paddingBottom: 400,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
    position: "relative",
  },
  inputLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    marginLeft: 2,
  },
  inputField: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    paddingHorizontal: 16,
    backgroundColor: "white",
    fontFamily: "General-Sans-Regular",
    fontSize: 15,
    color: "#333",
  },
  focusedInput: {
    borderColor: "#470A68",
    borderWidth: 1.5,
  },
  bioInput: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  infoText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginLeft: 2,
    marginBottom: 15,
  },
  errorInput: {
    borderColor: "#E53935",
  },
  errorText: {
    color: "#E53935",
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  heading: {
    marginTop: 60,
    paddingBottom: 20,
    marginLeft: 20,
    fontFamily: "Filson-Bold",
    color: "white",
    fontSize: 22,
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
  },
  buttonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
  },
  locationButton: {
    width: "100%",
    backgroundColor: "#F3E545",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  locationButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
  },
});

type FormData = {
  businessName: string;
  email: string;
  instagramHandle: string;
  websiteLink: string; // subdomain only
  shopBio: string;
};

type FormErrors = {
  businessName: string;
  email: string;
  instagramHandle: string;
  websiteLink: string;
  shopBio: string;
};

const Onboard = () => {
  const { authState, updateRegistrationData } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    email: "",
    instagramHandle: "",
    websiteLink: "",
    shopBio: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    businessName: "",
    email: "",
    instagramHandle: "",
    websiteLink: "",
    shopBio: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && focusedField) {
      const scrollHeight = ["shopBio", "websiteLink"].includes(focusedField)
        ? 200
        : 0;
      scrollViewRef.current.scrollTo({ y: scrollHeight, animated: true });
    }
  }, [focusedField]);

  const onBlur = () => {
    setFocusedField(null);
    scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
  };
  const handleInstagramHandleChange = (value: string) => {
    let v = value.toLowerCase();
    // only allow dots & underscores
    v = v.replace(/[^a-z0-9._]/g, "");
    setFormData({ ...formData, instagramHandle: v });
  };
  const handleChange = (field: keyof FormData, value: string) => {
    if (field === "websiteLink") {
      let v = value.toLowerCase();
      v = v.replace(/https?:\/\//g, "");
      v = v.replace(/\s+/g, "");
      if (v.includes(".") && field === "websiteLink") {
        v = v.split(".")[0];
      }
      v = v.replace(/[^a-z0-9-]/g, "");
      setFormData({ ...formData, [field]: v });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    // Clear error when typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Business name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.instagramHandle.trim()) {
      newErrors.instagramHandle = "Instagram handle is required";
      isValid = false;
    }

    if (!formData.shopBio.trim()) {
      newErrors.shopBio = "Shop bio is required";
      isValid = false;
    }

    // Website link (subdomain) validation
    const subRegex = /^(?!-)[a-z0-9-]{3,}(?<!-)$/;
    if (!formData.websiteLink.trim()) {
      newErrors.websiteLink = "subdomain is required";
      isValid = false;
    } else if (!subRegex.test(formData.websiteLink)) {
      newErrors.websiteLink =
        "Only a-z, 0-9, hyphen; min 3 chars; no '-' at ends";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Save form data to global auth state
      updateRegistrationData({
        businessName: formData.businessName,
        email: formData.email,
        instagramHandle: formData.instagramHandle,
        bio: formData.shopBio,
        subdomain: formData.websiteLink, // Using websiteLink as subdomain for now
      });

      // Navigate to location selection
      handleSelectLocation();
    }
    // Error handling is already done in validateForm()
  };

  const handleSelectLocation = () => {
    router.push("/locationSearch");
  };

  return (
    <HeaderPage title="Let's get your account ready">
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
        <View style={styles.mainbox}>
          {/* Business Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputField,
                focusedField === "businessName" && styles.focusedInput,
                errors.businessName ? styles.errorInput : null,
              ]}
              value={formData.businessName}
              onChangeText={(text) => handleChange("businessName", text)}
              placeholder="Business Name"
              placeholderTextColor="#999"
              onFocus={() => setFocusedField("businessName")}
              onBlur={onBlur}
            />
            {errors.businessName ? (
              <Text style={styles.errorText}>{errors.businessName}</Text>
            ) : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputField,
                focusedField === "email" && styles.focusedInput,
                errors.email ? styles.errorInput : null,
              ]}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={onBlur}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Instagram Handle Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputField,
                focusedField === "instagramHandle" && styles.focusedInput,
                errors.instagramHandle ? styles.errorInput : null,
              ]}
              value={formData.instagramHandle}
              onChangeText={(text) => handleInstagramHandleChange(text)}
              placeholder="Store's Instagram Handle"
              placeholderTextColor="#999"
              autoCapitalize="none"
              onFocus={() => setFocusedField("instagramHandle")}
              autoComplete="off"
              autoCorrect={false}
              onBlur={onBlur}
            />
            {errors.instagramHandle ? (
              <Text style={styles.errorText}>{errors.instagramHandle}</Text>
            ) : null}
          </View>

          {/* Website Link Input (subdomain + fixed suffix) */}
          <View style={styles.inputContainer}>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.inputField,
                  { paddingRight: 140 },
                  focusedField === "websiteLink" && styles.focusedInput,
                  errors.websiteLink ? styles.errorInput : null,
                ]}
                value={formData.websiteLink}
                onChangeText={(text) => handleChange("websiteLink", text)}
                placeholder="yourstore"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                onFocus={() => setFocusedField("websiteLink")}
                onBlur={onBlur}
              />
              <View
                style={{
                  position: "absolute",
                  right: 12,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#666",
                    fontFamily: "General-Sans-Regular",
                    fontSize: 15,
                  }}
                >
                  .unicapp.in
                </Text>
              </View>
            </View>
            <Text style={styles.infoText}>
              Your site will be: {formData.websiteLink || "yourstore"}
              .unicapp.in
            </Text>
            {errors.websiteLink ? (
              <Text style={styles.errorText}>{errors.websiteLink}</Text>
            ) : null}
          </View>

          {/* Shop Bio Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputField,
                styles.bioInput,
                focusedField === "shopBio" && styles.focusedInput,
                errors.shopBio ? styles.errorInput : null,
              ]}
              value={formData.shopBio}
              onChangeText={(text) => handleChange("shopBio", text)}
              placeholder="Bio for your shop"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              onFocus={() => setFocusedField("shopBio")}
              onBlur={onBlur}
            />
            {errors.shopBio ? (
              <Text style={styles.errorText}>{errors.shopBio}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Location Selection Button */}

      {/* Next Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </HeaderPage>
  );
};

export default Onboard;
