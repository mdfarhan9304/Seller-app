import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { productAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ProductsMenu = ({
  product,
  onEdit,
  onSoldOut,
  refresh,
}: {
  product: any;
  onEdit: () => void;
  onSoldOut: () => void;
  refresh: () => void;
}) => {
  const { authState } = useAuth();
  const storeName = authState.store?.name || "Store Name";
  const { closeModal } = useModal();

  const onToggleActive = async () => {
    const formData = new FormData();
    formData.append("isActive", `${!product?.isActive}`);
    const updateProduct = await productAPI.updateProduct(product.id, formData);
    if (updateProduct) {
      closeModal();
      refresh();
    }
  };
  const options = [
    {
      label: "Edit Product",
      icon: "pencil",
      onPress: () => {
        closeModal();
        onEdit();
      },
    },
    {
      label: "Copy Product Link",
      icon: "copy",
      onPress: () => {
        closeModal();
        const link = `https://${authState.subdomain}.unicapp.in/stores/${authState.subdomain}/products/${product.id}`;
        Clipboard.setString(link);
      },
    },
    {
      label: "Mark as Sold out",
      color: "red",
      isHidden: product.quantity === 0,
      icon: "close",
      onPress: () => {
        closeModal();
        onSoldOut();
      },
    },
    {
      label: product.isActive ? "Hide Product" : "Show Product",
      icon: product.isActive ? "eye-off" : "eye",
      onPress: () => {
        closeModal();
        onToggleActive();
      },
    },
    {
      label: "Share Product",
      icon: "share",
      onPress: () => {
        const shareMessage = `Check out this product from ${storeName} and get delivery under 60 mminutes`;
        const shareUrl = `https://${authState.subdomain}.unicapp.in/stores/${authState.subdomain}/products/${product.id}`;
        const shareOptions = {
          title: `${product.productName} - ${storeName}`,
          message: shareMessage,
          url: shareUrl,
        };
        Share.share(shareOptions);
      },
    },
  ];

  return (
    <View style={styles.container}>
      {options
        .filter((option) => !option.isHidden)
        .map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={option.onPress}
            style={styles.option}
          >
            <Ionicons name={option.icon as any} size={24} color={option.color} />
            <Text>{option.label}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
});
