import AnimatedPressable from "@/components/ui/AnimatedPressable";
import HeaderPage from "@/components/ui/HeaderPage";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { integrationAPI } from "../../../services/api";

const PaymentSettingsScreen = () => {
  const [storeIntegrations, setStoreIntegrations] = useState<any>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadStoreIntegrations();
  }, []);

  const syncProducts = async (integrationId: string) => {
    try {
      setSyncing(integrationId);
      const response = await integrationAPI.syncProducts(integrationId);
      console.log(response);
      Alert.alert("Success", integrationId + " products synced successfully.");
    setSyncing(null);
    } catch (error) {
      setSyncing(null);
      console.error("Error syncing products:", error);
      Alert.alert("Error", "Failed to sync products. Please try again.");
    }
  };

  const loadStoreIntegrations = async () => {
    try {
      const response = await integrationAPI.getIntegrations();
      console.log(response);
      setStoreIntegrations(response.integrations);
    } catch (error) {
      console.error("Error loading store integrations:", error);
      Alert.alert(
        "Error",
        "Failed to load store integrations. Please try again."
      );
    }
  };

  return (
    <HeaderPage title="Store Integrations">
      <View style={styles.mainContent}>
        {storeIntegrations.wix ? (
          <AnimatedPressable
            style={styles.optionContainer}
            onPress={() => syncProducts("wix")}
          >
            <FontAwesome6 name="wix" size={24} color="#0094B2" />
            <View>
              <Text style={styles.optionText}>Wix Store</Text>
              <Text style={styles.optionSubText}>Tap to sync products</Text>
            </View>
            <View style={styles.chevronIcon}>
              {syncing === "wix" ? (
                <ActivityIndicator
                  style={styles.chevronIcon}
                  size={12}
                  color="grey"
                />
              ) : (
                <Ionicons
                  style={styles.chevronIcon}
                  name="chevron-forward"
                  size={12}
                  color="grey"
                />
              )}
            </View>
          </AnimatedPressable>
        ) : null}
        {storeIntegrations.shopify ? (
          <AnimatedPressable
            style={styles.optionContainer}
            onPress={() => syncProducts("shopify")}
          >
            <FontAwesome6 name="shopify" size={24} color="#0094B2" />
            <View>
              <Text style={styles.optionText}>Shopify</Text>
              <Text style={styles.optionSubText}>Tap to sync products</Text>
            </View>
            <Ionicons
              style={styles.chevronIcon}
              name="chevron-forward"
              size={12}
              color="grey"
            />
          </AnimatedPressable>
        ) : null}
      </View>
    </HeaderPage>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    padding: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
  optionSubText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "grey",
    marginLeft: 12,
  },
  chevronIcon: {
    marginLeft: "auto",
  },
});

export default PaymentSettingsScreen;
