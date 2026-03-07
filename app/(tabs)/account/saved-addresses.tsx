import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "../../../components/Header";

type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

const SavedAddressesScreen = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Load addresses from AsyncStorage on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const storeData = await AsyncStorage.getItem("store_data");
      const storeAddress = JSON.parse(storeData || "{}").address;
      let parsedAddresses: SavedAddress[] = [];

      if (storeAddress) {
        parsedAddresses = [storeAddress];
      }
      // If no saved addresses or empty array, check seller location from seller_data
      if (!parsedAddresses || parsedAddresses.length === 0) {
        const sellerData = await AsyncStorage.getItem("seller_data");
        if (sellerData) {
          const seller = JSON.parse(sellerData);

          // Check if seller has sellerLocation (from API response)
          if (seller.sellerLocation) {
            const location = seller.sellerLocation;
            const formattedAddress: SavedAddress = {
              id: location._id || "seller_location",
              label: "Business Location",
              address: [
                location.buildingName && location.floor
                  ? `${location.buildingName}, Floor ${location.floor}`
                  : location.buildingName || "",
                location.landmark || "",
                location.address || "",
              ]
                .filter(Boolean)
                .join(", "),
            };
            parsedAddresses = [formattedAddress];

            await AsyncStorage.setItem(
              "saved_addresses",
              JSON.stringify(parsedAddresses)
            );
          } else if (
            seller.addresses &&
            Array.isArray(seller.addresses) &&
            seller.addresses.length > 0
          ) {
            parsedAddresses = seller.addresses;
            await AsyncStorage.setItem(
              "saved_addresses",
              JSON.stringify(parsedAddresses)
            );
          }
        }
      }

      setAddresses(parsedAddresses);
    } catch (error) {
      console.error("Error loading addresses:", error);
      Alert.alert("Error", "Failed to load saved addresses");
    } finally {
      setLoading(false);
    }
  };

  // Save addresses to AsyncStorage
  const saveAddresses = async (updatedAddresses: SavedAddress[]) => {
    try {
      await AsyncStorage.setItem(
        "saved_addresses",
        JSON.stringify(updatedAddresses)
      );
      // Also update seller_data if it exists
      const sellerData = await AsyncStorage.getItem("seller_data");
      if (sellerData) {
        const seller = JSON.parse(sellerData);
        seller.addresses = updatedAddresses;
        await AsyncStorage.setItem("seller_data", JSON.stringify(seller));
      }
    } catch (error) {
      console.error("Error saving addresses:", error);
    }
  };

  const handleAddNewAddress = () => {
    // For now, add a placeholder address - in real app, navigate to add new address screen
    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      label: "New Address",
      address: "Enter address details...",
    };
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);
    Alert.alert(
      "Success",
      "New address added. You can edit it to update the details."
    );
  };

  const handleEditAddress = (addressId: string) => {
    // In real app, navigate to edit screen with the address
    Alert.alert("Edit Address", "Edit functionality will be implemented");
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedAddresses = addresses.filter(
              (addr) => addr.id !== addressId
            );
            setAddresses(updatedAddresses);
            await saveAddresses(updatedAddresses);

            // If all addresses are deleted, reload from seller_data to show seller location
            if (updatedAddresses.length === 0) {
              await loadAddresses();
            }

            Alert.alert("Success", "Address deleted successfully");
          },
        },
      ]
    );
  };

  const handleShareAddress = (addressId: string) => {
    console.log("Share address:", addressId);
  };
  const address: any = addresses[0];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#8D14CE", "#470A68"]} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Header title="Addresses" showBackButton={true} />

          <View style={styles.mainContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8D14CE" />
                <Text style={styles.loadingText}>Loading addresses...</Text>
              </View>
            ) : (
              <>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Saved Addresses List */}
                  {addresses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons
                        name="location-outline"
                        size={64}
                        color="#D1D5DB"
                      />
                      <Text style={styles.emptyTitle}>No Saved Addresses</Text>
                      <Text style={styles.emptySubtitle}>
                        Add your first address to get started
                      </Text>
                    </View>
                  ) : (
                    <View key={address.id} style={styles.addressCard}>
                      <View style={styles.addressHeader}>
                        <View style={styles.addressLabelContainer}>
                          <Ionicons name="home" size={24} color="#8D14CE" />
                        </View>
                        <View>
                          <Text style={styles.addressLabel}>
                            {address.floor} Floor, {address.buildingName}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 4 }}>
                            <Text numberOfLines={3} style={styles.addressText}>
                              {address.landmark}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* <View style={styles.addressActions}>
                <TouchableOpacity 
                  onPress={() => handleEditAddress(address.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleDeleteAddress(address.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleShareAddress(address.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                </View> */}
                    </View>
                  )}
                </ScrollView>

                {/* Add New Address Button */}
                {/* <View style={styles.addButtonContainer}>
                  <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
                    <Text style={styles.addButtonText}>Add new address</Text>
                  </TouchableOpacity>
                </View> */}
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
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
    marginTop: -20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 25,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 16,
    gap: 16,
  },
  addressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
  },
  addressText: {
    fontSize: 12,
    fontFamily: "General-Sans-Medium",
    color: "rgba(0, 0, 0, 0.75)",
    lineHeight: 16,
    marginTop: 8,
    width: "90%"
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "General-Sans-Medium",
    color: "#470A68",
    fontWeight: "600",
  },
  addButtonContainer: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    fontWeight: "600",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "General-Sans-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default SavedAddressesScreen;
