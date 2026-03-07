import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  User,
  Banknote,
  Bookmark,
  Link2,
  LogOut,
  PencilRuler,
  Truck,
  WalletMinimal,
} from "lucide-react-native";

import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { useProductUpdation } from "@/contexts/ProductUpdationContext";
import { useAuth } from "../../../contexts/AuthContext";

const AccountScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { authState } = useAuth();
  const subdomain = authState.subdomain;
  const [sellerData, setSellerData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { updatedTimeStamp } = useProductUpdation();

  // Load seller data from AsyncStorage
  React.useEffect(() => {
    loadSellerData();
  }, [updatedTimeStamp]);

  const loadSellerData = async () => {
    try {
      const stored = await AsyncStorage.getItem("seller_data");
      if (stored) {
        setSellerData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
    }
  };

  const businessName =
    sellerData?.businessName ||
    authState.seller?.businessName ||
    authState.user?.businessName ||
    authState.store?.name ||
    "Store Name";
  const storeUrl = subdomain
    ? `${subdomain}.unicapp.in`
    : "https://name.unicapp.in";
  const email = sellerData?.email || authState.seller?.email || "";
  const instagram =
    sellerData?.instagramHandle || authState.seller?.instagramHandle || "";
  const bio = sellerData?.bio || authState.seller?.bio || "";

  const handleLogout = async () => {
    try {
      // First clear the auth tokens
      await AsyncStorage.removeItem("auth_cookies");
      await AsyncStorage.removeItem("user_data");
      await AsyncStorage.removeItem("seller_data");

      // Call the logout function from context
      await logout();

      // Close the modal and navigate to the auth index
      setShowLogoutModal(false);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
      setShowLogoutModal(false);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {/* <View style={styles.safeArea}>
        <Text style={styles.headerTitle}>Account</Text>
      </View> */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gradient Profile Section */}
        <LinearGradient
          colors={["#8D14CE", "#470A68"]}
          style={styles.gradientCard}
        >
          <View style={styles.storeInfoContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={styles.logoContainer}>
                {/* Using placeholder for Unicapp logo - you can replace with actual logo */}
                {/* <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>UNICAPP</Text>
                </View> */}
                <Image
                  style={styles.image}
                  source={require("../../../assets/images/unicapp-logo.png")}
                />
              </View>
              <Text style={styles.storeTagline}>We&apos;re here to deliver.</Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.storeDetailsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>{businessName}</Text>
                <Text
                  style={styles.storeUrl}
                  onPress={() => Linking.openURL(`https://${storeUrl}`)}
                >
                  {storeUrl}
                </Text>
                {/* {email ? <Text style={styles.storeEmail}>{email}</Text> : null}
                {instagram ? <Text style={styles.storeInstagram}>@{instagram}</Text> : null}
                {bio ? <Text style={styles.storeBio} numberOfLines={2}>{bio}</Text> : null} */}
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/your-account")}
          >
            <User size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Your Account</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/saved-addresses")}
          >
            <Bookmark size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Store Address</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/store-integrations")}
          >
            <Link2 size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Store Integrations</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/delivery-settings")}
          >
            <Truck size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Delivery Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/personalize")}
          >
            <PencilRuler size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Personalise</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/account/finances")}
          >
            <WalletMinimal size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>My Wallet</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => router.push("/(tabs)/account/payment-settings")}
          >
            <Banknote size={20} color="black" strokeWidth={2.2} />
            <Text style={styles.menuItemText}>Payment Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </AnimatedPressable>
        </View>

        {/* Logout Button */}
        <AnimatedPressable
          style={styles.logoutButton}
          onPress={showLogoutConfirmation}
        >
          <View>
            <Ionicons name="log-out-outline" size={20} color="#BB271A" />
          </View>
          <Text style={styles.logoutText}>Log out</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out-outline" size={24} color="#BB271A" />
              <Text style={styles.modalTitle}>Logout Confirmation</Text>
            </View>

            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>
              <AnimatedPressable
                style={styles.cancelButton}
                onPress={cancelLogout}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </AnimatedPressable>

              <AnimatedPressable
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },
  safeArea: {
    paddingTop: 60,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 20,
    color: "#000",
    fontWeight: "700",
    // marginTop: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 148, // Add padding for the new tab bar height + extra space
  },
  gradientCard: {
    marginTop: 32,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  storeInfoContainer: {
    width: "100%",
  },
  logoContainer: {
    marginBottom: 0,
  },
  image: {
    width: 126,
    height: 32,
    resizeMode: "contain",
  },
  logoPlaceholder: {
    // Placeholder for the actual logo
    padding: 8,
  },
  logoText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  storeName: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginVertical: 10,
  },
  storeUrl: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 10,
  },
  storeEmail: {
    fontFamily: "General-Sans-Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
  },
  storeInstagram: {
    fontFamily: "General-Sans-Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  storeBio: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 8,
    fontStyle: "italic",
  },
  storeTagline: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
  },
  storeDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },
  menuSection: {
    // marginTop: 12,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 16,
    columnGap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  menuItemText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.75)",
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(187, 39, 26, 0.08)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  logoutIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderRadius: 8,
    backgroundColor: "rgba(187,39,26,0.08)",
  },
  logoutText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#BB271A",
    flex: 1,
    marginLeft: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 12,
  },
  modalMessage: {
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.7)",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.75)",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#BB271A",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AccountScreen;
