import { resizeImage } from "@/components/ProductCard";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import HeaderPage from "@/components/ui/HeaderPage";
import { Colors } from "@/constants/Colors";
import { productAPI } from "@/services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateOrderScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any>(
    {} as Record<string, boolean>
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleProceedToAddress = () => {
    router.push({
      pathname: "/create-order/cart" as any,
      params: {
        products: JSON.stringify(Object.keys(selectedProducts)),
      },
    });
  };
  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const response = await productAPI.getAllProducts();
      const products = response.products;
      setProducts(products || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);
  return (
    <HeaderPage
      loading={loading}
      subHeaderComponent={
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={"#ddd"}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={styles.searchInput}
          placeholder="Search Products"
        />
      }
      title="Create Order"
    >
      <FlatList
        data={products.filter((product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Select Products</Text>
            {Object.keys(selectedProducts).length > 0 && (
              <AnimatedPressable
                style={styles.clearButton}
                onPress={() => {
                  setSelectedProducts({});
                  setSearchQuery("");
                }}
              >
                <Ionicons name="close" size={16} color="#8D14CE" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </AnimatedPressable>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={{
          padding: 16,
        }}
        renderItem={({ item }: { item: any }) => (
          <AnimatedPressable
            onPress={() =>
              setSelectedProducts((prev: Record<string, boolean>) => {
                const newProducts = { ...prev };
                if (newProducts[item.id || item._id]) {
                  delete newProducts[item.id || item._id];
                } else {
                  newProducts[item.id || item._id] = true;
                }
                return newProducts;
              })
            }
            style={styles.productCard}
          >
            <MaterialCommunityIcons
              color={
                selectedProducts[item.id || item._id] ? "#8D14CE" : "black"
              }
              name={
                selectedProducts[item.id || item._id]
                  ? "check-circle"
                  : "checkbox-blank-circle-outline"
              }
              size={24}
              style={styles.checkIcon}
            />
            <Image
              source={{ uri: resizeImage(item.thumbnail?.[0]?.url || item.image[0].url) }}
              style={styles.productImage}
            />
            <View>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.productPrice}>₹{item.price}</Text>
            </View>
          </AnimatedPressable>
        )}
      />
      {Object.keys(selectedProducts).length > 0 && (
        <AnimatedPressable
          onPress={handleProceedToAddress}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>Proceed to Address</Text>
        </AnimatedPressable>
      )}
    </HeaderPage>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    gap: 12,
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  productName: {
    fontFamily: "Filson-Bold",
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#777",
    fontWeight: "700",
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#2d2358",
    fontWeight: "600",
    marginVertical: 12,
  },
  checkIcon: {
    // position: "absolute",
    // top: 10,
    // left: 10,
    // zIndex: 10,
    alignSelf: "center",
  },
  nextButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  nextButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: Colors.black,
    fontWeight: "700",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    color: "#8D14CE",
    fontWeight: "700",
  },
});
