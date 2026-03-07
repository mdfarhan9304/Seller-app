import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ProductCardProps = {
  product: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    description: string;
    image: { id: string; url: string }[];
    thumbnail: { id: string; url: string }[];
    category?: string;
    isActive?: boolean;
  };
  onEdit: (productId: string) => void;
  onPress?: () => void;
};


export const resizeImage = (image: string) => {
  return image.replace("w_50,h_50", "w_200,h_200");
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onPress,
}) => {
  return (
    <TouchableOpacity style={[styles.card, product.isActive ? {} : styles.inactiveCard]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imgWrap}>
        {!product.isActive ? (
          <Text style={styles.hiddenText}>Hidden</Text>
        ) : null}
        {product.image[0]?.url ? (
          <Image
            source={{ uri: resizeImage(product.thumbnail?.[0]?.url || product.image[0].url) }}
            style={styles.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.img, styles.placeholder]}>
            <Ionicons name="image-outline" size={34} color="#aaa" />
          </View>
        )}
      </View>
      <View style={styles.infoWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {product.productName}
          </Text>
        </View>
        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.qty}>Qty: {product.quantity}</Text>
         
        </View>
      </View>
      {/* Center-right edit icon */}
      <TouchableOpacity
        style={styles.verticalEditBtn}
        onPress={() => onEdit(product.id)}
        activeOpacity={0.6}
        hitSlop={8}
      >
        <Ionicons name="create-outline" size={22} color="#8D14CE" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
    minHeight: 110,
    alignItems: "center",
    position: "relative",
    paddingRight: 48, // add space for edit icon
  },
  imgWrap: {
    width: 86,
    height: 86,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    overflow: "hidden",
  },
  hiddenText: {
    top: 0, 
    right: 0,
    textAlign : "center",
    position: "absolute",
    left: 0,
    zIndex: 10,
    alignSelf: "flex-start",
    backgroundColor: "red",
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
    padding: 2,
  },
  img: {
    width: "100%",
    height: "100%",
    borderRadius: 10
  },
  placeholder: {
    backgroundColor: "#f0eef6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoWrap: {
    flex: 1,
    marginRight: 16,
    minHeight: 84,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#2d2358",
    flex: 1,
    marginRight: 8,
    fontWeight: "600",
  },
  editBtn: {
    padding: 5,
  },
  price: {

    fontFamily: "General-Sans-Medium",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    justifyContent: "space-between",
  },
  qty: {
    color: "#555",
    fontSize: 13,
    fontFamily: "General-Sans-Regular",
  },
  badgeWrap: {
    backgroundColor: "#8D14CE",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    marginLeft: 3,
    maxWidth: 65,
  },
  verticalEditBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(141, 20, 206, 0.06)",
    position: "absolute",
    right: 22,
    top: "50%",
    marginTop: -20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  inactiveCard: {
    opacity: 0.5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default React.memo(ProductCard);
