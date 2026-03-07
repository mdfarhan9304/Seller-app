import { FilterModal } from "@/components/FilterModal";
import ProductCard from "@/components/ProductCard";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { StoreHeaderCard } from "@/components/StoreHeaderCard";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { useProductUpdation } from "@/contexts/ProductUpdationContext";
import { useToast } from "@/contexts/ToastContext";
import { productAPI } from "@/services/api";
import Clipboard from "@react-native-clipboard/clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductsMenu } from "./modals/productsMenu";

const { width, height } = Dimensions.get("window");

// Product type based on API response
type Product = {
  id: string;
  productName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  onehourDelivery: boolean;
  image: {
    id: string;
    url: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  thumbnail?: {
    id: string;
    url: string;
  }[];
  category?: any;
  activeFrom: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { authState, initializeAuth, refreshSellerPreferences } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paramsLastUpdated, setParamsLastUpdated] = useState(
    parseInt(params.paramsLastUpdated as string),
  );
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { updatedTimeStamp } = useProductUpdation();
  const { openModal } = useModal();
  // Get store information from auth context
  const subdomain = authState.subdomain;
  const businessName = authState.store?.name || "Store Name";
  const storeUrl = subdomain
    ? `https://${subdomain}.unicapp.in`
    : "https://name.unicapp.in";
  // Prefer personalized logo from seller preferences, then any store logo, else fallback
  const storeLogoUrl =
    authState.sellerPreferences?.logo?.url ||
    (authState.store as any)?.logo?.url ||
    null;

  const products = useMemo(() => {
    let filtered = allProducts;

    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const productCategoryId =
          typeof product.category === "string"
            ? product.category
            : product.category?._id || product.category?.id || "";
        return productCategoryId === selectedCategory;
      });
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const productName = product.productName?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category =
          typeof product.category === "string"
            ? product.category.toLowerCase()
            : product.category?.name?.toLowerCase() || "";

        return (
          productName.includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory]);

  const availableCategories = useMemo(() => {
    if (allProducts.length === 0) return [];

    // Get all unique category IDs from products
    const categoryIdsWithProducts = new Set<string>();
    allProducts.forEach((product) => {
      const categoryId =
        typeof product.category === "string"
          ? product.category
          : product.category?._id || product.category?.id || "";
      if (categoryId) {
        categoryIdsWithProducts.add(categoryId);
      }
    });

    // Filter categories to only include those with products
    return categories.filter((category) =>
      categoryIdsWithProducts.has(category._id),
    );
  }, [allProducts, categories]);

  const fetchCategories = async () => {
    const response = await productAPI.getCategories();
    if (response && response.categories) {
      setCategories(response.categories);
    }
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const result = await productAPI.getAllProducts(); // Fetch all products without search
      if (result && result.products) {
        setAllProducts(result.products);
      } else {
        setAllProducts([]);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load products. Please try again.";
      setError(errorMessage);

      if (!isRefresh) {
        setAllProducts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchProducts(true);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [updatedTimeStamp]);

  // Refresh seller preferences (logo etc.) every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshSellerPreferences();
    }, [])
  );

  const refresh = useCallback(() => {
    // Just fetch products, don't re-initialize auth
    fetchProducts();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     initializeAuth().then(() => {
  //       fetchProducts();
  //     });
  //   }, [])
  // );

  const navigateToProductDetail = () => {
    router.push("/home/add-product");
  };

  const navigateToGetEstimate = () => {
    router.push({
      pathname: "/create-order",
    });
  };

  const navigateToSendPackage = () => {
    router.push("/home/add-product");
  };

  const handleSoldOut = useCallback(
    async (product: Product) => {
      const formData = new FormData();
      formData.append("stock", "0");
      const result = await productAPI.updateProduct(product.id, formData);
      refresh();
      Alert.alert(
        "Success",
        "Product has been marked as sold out successfully",
        [{ text: "OK" }],
      );
    },
    [router],
  );

  const navigateToViewProduct = useCallback(
    (product: Product) => {
      router.push({
        pathname: "/home/add-product",
        params: {
          // ...product,
          activeFrom: product.activeFrom,
          editMode: "true",
          productId: product.id,
          productName: product.productName,
          price: product.price.toString(),
          originalPrice:
            product.originalPrice?.toString() || product.price.toString(),
          quantity: product.quantity.toString(),
          description: product.description,
          onehourDelivery: product.onehourDelivery.toString(),
          images: JSON.stringify(
            product.image.map((img) => ({ id: img.id, uri: img.url })),
          ),
          category: (product as any).category || "",
        },
      });
    },
    [router],
  );

  // Memoize renderItem to prevent unnecessary re-renders
  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      return (
        <ProductCard
          product={{
            ...item,
            thumbnail: item.thumbnail || [],
            category:
              typeof item.category === "string"
                ? item.category
                : item.category?.name || "",
          }}
          onEdit={() =>
            openModal(
              <ProductsMenu
                product={item}
                onEdit={() => navigateToViewProduct(item)}
                onSoldOut={() => handleSoldOut(item)}
                refresh={refresh}
              />,
            )
          }
          onPress={() =>
            openModal(
              <ProductsMenu
                product={item}
                onEdit={() => navigateToViewProduct(item)}
                onSoldOut={() => handleSoldOut(item)}
                refresh={refresh}
              />,
            )
          }
        />
      );
    },
    [navigateToViewProduct],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const openFilterModal = useCallback(() => {
    openModal(
      <FilterModal
        categories={availableCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />,
    );
  }, [availableCategories, selectedCategory]);

  return (
    <View style={styles.container}>
      <StoreHeaderCard
        businessName={businessName}
        storeUrl={storeUrl}
        storeLogoUrl={storeLogoUrl || undefined}
        onCopyUrl={() => {
          Clipboard.setString(storeUrl);
          showToast("Store URL copied to clipboard", 1500);
        }}
        onOpenUrl={() => Linking.openURL(storeUrl)}
        onAddProduct={navigateToSendPackage}
        onCreateOrder={navigateToGetEstimate}
      />

      <View style={styles.productContainer}>
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={openFilterModal}
          selectedCategory={selectedCategory}
        />
      </View>

      {/* Product List - Only FlatList */}
      {loading && !refreshing ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#470A68" />
          <Text style={styles.emptyText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <TouchableOpacity
              style={styles.addProductBox}
              onPress={navigateToProductDetail}
            >
              <Text style={styles.addProductText}>
                {searchQuery ? "No products found" : "Add your first product"}
              </Text>
              {!searchQuery && (
                <View style={styles.plusButtonContainer}>
                  <View style={styles.plusButton}>
                    <View style={styles.horizontalLine} />
                    <View style={styles.verticalLine} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8D14CE"]}
              tintColor="#8D14CE"
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => {
            const ITEM_HEIGHT = 130;
            return {
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            };
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: StatusBar.currentHeight || 40,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 128,
  },
  productContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  ctaButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryCtaButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  secondaryCtaButton: {
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  ctaIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F5C445",
    alignItems: "center",
    justifyContent: "center",
  },
  
  ctaLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  addProductBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  addProductText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 10,
  },
  plusButtonContainer: {
    marginTop: 10,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(71, 10, 104, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalLine: {
    width: 16,
    height: 2,
    backgroundColor: "#470A68",
    position: "absolute",
  },
  verticalLine: {
    width: 2,
    height: 16,
    backgroundColor: "#470A68",
    position: "absolute",
  },
  productsSection: {
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  addProductIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    padding: 10,
    elevation: 2,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productImageContainer: {
    width: 90,
    height: 110,
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
    padding: 3,
  },
  productImage: {
    width: "90%",
    height: "90%",
    borderRadius: 4,
  },
  placeholderImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#470A68",
    fontWeight: "700",
    marginBottom: 8,
  },
  productDescription: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "#888",
  },
  editButton: {
    backgroundColor: "rgba(71, 10, 104, 0.12)",
    padding: 6,
    borderRadius: "50%",
  },
  editText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 10,
    color: "#470A68",
    marginLeft: 2,
  },
  storeDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFB3B3",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#FF3B30",
    marginLeft: 8,
    fontFamily: "General-Sans-Regular",
  },
  retryButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "General-Sans-Medium",
  },
  storeUrlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
});

export default HomeScreen;
