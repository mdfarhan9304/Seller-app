import HeaderPage from "@/components/ui/HeaderPage";
import { useProductUpdation } from "@/contexts/ProductUpdationContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useAuth } from "../../../contexts/AuthContext";
import { authAPI, preferencesAPI } from "../../../services/api";

const YourAccountScreen = () => {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { markProductUpdated } = useProductUpdation();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const storedStore = await AsyncStorage.getItem("store_data");
      if (storedStore) {
        const store = JSON.parse(storedStore);
        setCompanyName(store.name || "");
        setEmail(store.email || "");
        setWebsite(
          store.subdomain
            ? `${store.subdomain}.unicapp.in`
            : authState.subdomain
            ? `${authState.subdomain}.unicapp.in`
            : ""
        );
        setInstagram(store.instagramHandle || "");
        setBio(store.bio || "");
      } else {
        // Fallback to authState store
        setCompanyName(authState.store?.name || "");
        setEmail(authState.store?.email || "");
        setWebsite(
          authState.subdomain ? `${authState.subdomain}.unicapp.in` : ""
        );
        setInstagram(authState.store?.instagramHandle || "");
        setBio(authState.store?.bio || "");
      }
    } catch (error) {
      console.error("Error loading account data:", error);
      Alert.alert("Error", "Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyName.trim() || !email.trim()) {
      Alert.alert("Error", "Company name and email are required");
      return;
    }

    try {
      setSaving(true);

      const updateData: any = {
        businessName: companyName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        instagramHandle: instagram.trim(),
      };

      const response = await authAPI.updateSellerDetails(updateData);

      if (response.store) {
        await AsyncStorage.setItem(
          "store_data",
          JSON.stringify(response.store)
        );
        setCompanyName(response.store.name || "");
        setEmail(response.store.email || "");
        setInstagram(response.store.instagramHandle || "");
        setBio(response.store.bio || "");
      }

      Alert.alert("Success", "Account details updated successfully");
      markProductUpdated();
      router.back();
    } catch (error: any) {
      console.error("Error saving account data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update account data"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const response = await preferencesAPI.deleteAccount();
              if (response.coolOff) {
                Alert.alert(
                  "Success",
                  `You can login again in ${response.coolOff} days to restore your account.`,
                  []
                );
                await logout();
                router.replace("/(auth)");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <HeaderPage title="Your Account">
      <View style={styles.mainContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8D14CE" />
            <Text style={styles.loadingText}>Loading account details...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Company Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter company name"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Website URL */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Website URL</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={website}
                  placeholder="your-store.unicapp.in"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  autoCapitalize="none"
                  editable={false}
                />
                <Text style={styles.helpText}>
                  This is the link to your unicapp website. Don't use any
                  special characters or space
                </Text>
              </View>

              {/* Instagram Handle */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Instagram Handle</Text>
                <TextInput
                  style={styles.input}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="@your_handle"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  autoCapitalize="none"
                />
              </View>

              {/* Bio */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Bio for your shop"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Delete Account</Text>
                <TouchableOpacity
                  style={styles.deleteAccountButton}
                  onPress={handleDeleteAccount}
                >
                  <Ionicons name="trash-outline" size={24} color="#BB271A" />
                  <Text style={styles.deleteAccountButtonText}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </HeaderPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // marginTop: -20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 25,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bioInput: {
    height: 118,
    paddingTop: 16,
  },
  inputDisabled: {
    backgroundColor: "#F0F0F0",
    opacity: 0.7,
  },
  helpText: {
    fontSize: 12,
    fontFamily: "General-Sans-Regular",
    color: "rgba(0, 0, 0, 0.5)",
    marginTop: 8,
    lineHeight: 16,
  },
  saveButtonContainer: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#F3E545",
    borderRadius: 8,
    padding: 16,
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
  saveButtonText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#666",
    marginTop: 16,
  },
  deleteAccountContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  deleteAccountText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BB271A",
    borderRadius: 8,
    padding: 16,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#BB271A",
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default YourAccountScreen;
