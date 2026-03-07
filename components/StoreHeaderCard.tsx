import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Package } from "lucide-react-native";
import { ShoppingBag } from "lucide-react-native";

type Props = {
  businessName: string;
  storeUrl: string;
  storeLogoUrl?: string | null;
  onCopyUrl: () => void;
  onOpenUrl: () => void;
  onAddProduct: () => void;
  onCreateOrder: () => void;
};

export const StoreHeaderCard: React.FC<Props> = ({
  businessName,
  storeUrl,
  storeLogoUrl,
  onCopyUrl,
  onOpenUrl,
  onAddProduct,
  onCreateOrder,
}) => {
  return (
    <LinearGradient
      colors={["#8D14CE", "#470A68"]}
      style={styles.gradientCard}
    >
      {/* Avatar + store name + URL */}
      <View style={styles.storeHeaderRow}>
        {storeLogoUrl ? (
          <Image style={styles.avatar} source={{ uri: storeLogoUrl }} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            {/* use purple color */}
            <MaterialIcons name="storefront" size={24} color="#000000" />
          </View>
        )}
        <View style={styles.storeTextContainer}>
          <Text style={styles.storeName}>{businessName}</Text>
          <View style={styles.storeUrlRow}>
            <Text
              style={styles.storeUrl}
              numberOfLines={1}
              onPress={onOpenUrl}
            >
              {storeUrl}
            </Text>
            <Pressable hitSlop={8} onPress={onCopyUrl}>
              <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Add Product / Create Order buttons */}
      <View style={styles.ctaRow}>
        <Pressable
          style={[styles.ctaButton, styles.primaryCtaButton]}
          onPress={onAddProduct}
        >
          <View >
            <FontAwesome5 name="plus" size={16} color="#F5C445" />
          </View>
          <Text style={styles.ctaLabel}>Add Product</Text>
        </Pressable>

        <Pressable
          style={[styles.ctaButton, styles.secondaryCtaButton]}
          onPress={onCreateOrder}
        >
          <View>
            <ShoppingBag size={20} color="#F5C445" strokeWidth={2.4} />
          </View>
          <Text style={styles.ctaLabel}>Create Order</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  storeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    // use yellow color
    backgroundColor: "#F5C445",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    color: "#FFFFFF",
  },
  storeTextContainer: {
    flex: 1,
  },
  storeName: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginVertical: 10,
  },
  storeUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  storeUrl: {
    // flex: 1,
    fontFamily: "General-Sans-Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  ctaButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryCtaButton: {
    backgroundColor: "rgba(245, 245, 245, 0.24);",

  },
  secondaryCtaButton: {
    backgroundColor: "rgba(245, 245, 245, 0.24);",
  },
  
  ctaLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
});

