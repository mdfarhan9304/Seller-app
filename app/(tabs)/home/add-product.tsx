import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Category, CategorySelector } from "@/components/CategorySelector";
import { PhotoItem, PhotoPicker } from "@/components/PhotoPicker";
import { ProductFormFields } from "@/components/ProductFormFields";
import { useProductUpdation } from "@/contexts/ProductUpdationContext";
import { productAPI } from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { markProductUpdated } = useProductUpdation();
  // Check if we're in edit mode
  const isEditMode = params.editMode === "true";
  const productId = params.productId as string;

  // Form state
  const [productName, setProductName] = useState(
    (params.productName as string) || ""
  );
  const [originalPrice, setOriginalPrice] = useState((params.originalPrice as string) || (params.price as string) || "");
  const [sellingPrice, setSellingPrice] = useState((params.price as string) || "");
  const [hasManuallyChangedSellingPrice, setHasManuallyChangedSellingPrice] = useState(false);
  const [categoryId, setCategoryId] = useState(
    (params.category as string) || ""
  );
  const [categoryName, setCategoryName] = useState("");
  const [details, setDetails] = useState((params.description as string) || "");
  const [quantity, setQuantity] = useState(
    parseInt(params.quantity as string) || 0
  );
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [scheduleDate, setScheduleDate] = useState(
    params.activeFrom ? new Date(params.activeFrom as string) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledText, setScheduledText] = useState("Select a date");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const initialOneHour = (() => {
    const v = params.onehourDelivery as any;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v.toLowerCase() === "true";
    return false;
  })();
  const [availableIn60Minutes, setAvailableIn60Minutes] =
    useState(initialOneHour);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await productAPI.getCategories();
        if (response && response.categories) {
          const list = response.categories.filter(
            (cat: Category) => cat.isActive
          );
          setCategories(list);
          // If editing, resolve category name from id
          if (!categoryName && categoryId) {
            const found = list.find((c: Category) => c._id === categoryId);
            if (found) setCategoryName(found.name);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          { _id: "1", name: "General", isActive: true },
          { _id: "2", name: "Electronics", isActive: true },
          { _id: "3", name: "Fashion", isActive: true },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize photos from existing images if in edit mode
  useEffect(() => {
    if (isEditMode && params.images) {
      try {
        const existingImages = JSON.parse(params.images as string);
        setPhotos(existingImages);
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }
  }, [isEditMode, params.images]);

  const handleOriginalPriceChange = (value: string) => {
    setOriginalPrice(value);
   
    if (!hasManuallyChangedSellingPrice) {
      setSellingPrice(value);
    }
  };

  const handleSellingPriceChange = (value: string) => {
    setSellingPrice(value);
    setHasManuallyChangedSellingPrice(true);
  };

  const handleCancel = () => {
    router.back();
  };


  const validateForm = () => {
    const errors: string[] = [];

    if (photos.length === 0 && !isEditMode) {
      errors.push("At least one product image is required");
    }
    if (!productName.trim()) {
      errors.push("Product name is required");
    }
    if (!originalPrice.trim()) {
      errors.push("Original price is required");
    } else {
      const originalPriceNum = parseFloat(originalPrice);
      if (isNaN(originalPriceNum) || originalPriceNum <= 0) {
        errors.push("Original price must be a valid number greater than 0");
      }
      if (originalPriceNum > 999999) {
        errors.push("Original price cannot exceed ₹999,999");
      }
    }

    if (!sellingPrice.trim()) {
      errors.push("Selling price is required");
    } else {
      const sellingPriceNum = parseFloat(sellingPrice);
      if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
        errors.push("Selling price must be a valid number greater than 0");
      }
      if (sellingPriceNum > 999999) {
        errors.push("Selling price cannot exceed ₹999,999");
      }
    }
    if (quantity < 1) {
      errors.push("Quantity must be at least 1");
    }
    if (quantity > 9999) {
      errors.push("Quantity cannot exceed 9,999 items");
    }
    if (!details.trim()) {
      errors.push("Product description is required");
    }
    if (details.length > 3000) {
      errors.push("Description cannot exceed 3000 characters");
    }
    if (!categoryId && !isEditMode) {
      errors.push("Please select a product category");
    }
    if(categoryName === "Custom" && !customCategoryInput.trim()) {
      errors.push("Custom category name is required");
    }
    console.log(categoryName, customCategoryInput);
    console.log(errors);
    return errors;
  };

  const isFormValid = () => {
    return validateForm().length === 0;
  };

  const handleDone = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      Alert.alert("Validation Error", validationErrors.join("\n"), [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("description", details);
      formData.append("price", sellingPrice); // Use selling price as the main price
      formData.append("originalPrice", originalPrice);
      formData.append("quantity", quantity.toString());
      if(customCategoryInput) {
        formData.append("customCategoryName", customCategoryInput);
      } else if (categoryId) {
        formData.append("category", categoryId);
      }
      formData.append("onehourDelivery", availableIn60Minutes.toString());

      // Add scheduled date/time if set to future
      // if (scheduleDate > new Date()) {
      formData.append("activeFrom", scheduleDate.toISOString());
      // }

      // In add mode: send all photos. In edit mode: send existing URLs + new local files
      if (isEditMode) {
        const existingImages = photos.filter(
          (p) => !p.uri.startsWith("file://")
        );
        const newLocalImages = photos.filter((p) =>
          p.uri.startsWith("file://")
        );

        if (existingImages.length > 0) {
          const existingUrls = existingImages.map((p) => p.uri);
          formData.append("existingImages", JSON.stringify(existingUrls));
        }

        for (let i = 0; i < newLocalImages.length; i++) {
          const photo = newLocalImages[i];
          const photoUri = photo.uri;
          const filename = photoUri.split("/").pop() || `photo${i}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          const fileData = {
            uri: photoUri,
            name: filename,
            type: type,
          } as any;
          formData.append("images", fileData);
        }

        if (existingImages.length === 0 && newLocalImages.length === 0) {
          Alert.alert("Error", "At least one product image is required");
          setIsLoading(false);
          return;
        }
      } else {
        if (photos.length === 0) {
          Alert.alert("Error", "At least one product image is required");
          setIsLoading(false);
          return;
        }

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const photoUri = photo.uri;
          const filename = photoUri.split("/").pop() || `photo${i}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          const fileData = {
            uri: photoUri,
            name: filename,
            type: type,
          } as any;
          formData.append("images", fileData);
        }
      }

      let result;
      if (isEditMode) {
        result = await productAPI.updateProduct(productId, formData);
      } else {
        result = await productAPI.addProduct(formData);
      }
      markProductUpdated();

      Alert.alert(
        "Success",
        `Product has been ${isEditMode ? "updated" : "added"} successfully`,
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} product:`,
        error
      );
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "add"
          } product. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await productAPI.deleteProduct(productId);
              Alert.alert("Success", "Product has been deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error("Error deleting product:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete product. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Date picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || scheduleDate;
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    } else {
      setTimeout(() => {
        setShowDatePicker(false);
      }, 10000);
    }
    setScheduleDate(currentDate);
    updateScheduledText(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    const currentTime = selectedTime || scheduleDate;
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    } else {
      const timeout = setTimeout(() => {
        setShowTimePicker(false);
      }, 10000);
    }
    setScheduleDate(currentTime);
    updateScheduledText(currentTime);
  };

  const updateScheduledText = (date: Date) => {
    const formattedDateTime = date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setScheduledText(formattedDateTime);
  };

  const showDatepicker = () => {
    setShowTimePicker(false);
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const handleClearSchedule = () => {
    setScheduleDate(new Date());
    setScheduledText("Select a date");
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleCategoryPress = useCallback(() => {
    setShowCategoryModal(true);
  }, []);

  const handleCategorySelect = (category: Category) => {
    setCategoryId(category._id);
    setCategoryName(category.name);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FCFCFC"
          translucent={true}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Product" : "Add Product"}
          </Text>
        </View>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <PhotoPicker
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={6}
          />
          <ProductFormFields
            productName={productName}
            onCustomCategoryChange={setCustomCategoryInput}
            onProductNameChange={setProductName}
            originalPrice={originalPrice}
            onOriginalPriceChange={handleOriginalPriceChange}
            sellingPrice={sellingPrice}
            onSellingPriceChange={handleSellingPriceChange}
            quantity={quantity}
            onQuantityChange={setQuantity}
            details={details}
            onDetailsChange={setDetails}
            categoryName={categoryName}
            onCategoryPress={handleCategoryPress}
            loadingCategories={loadingCategories}
            scheduleDate={scheduleDate}
            scheduledText={scheduledText}
            showDatePicker={showDatePicker}
            showTimePicker={showTimePicker}
            onShowDatePicker={showDatepicker}
            onShowTimePicker={showTimepicker}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
            onClearSchedule={handleClearSchedule}
            availableIn60Minutes={availableIn60Minutes}
            onAvailableIn60MinutesChange={setAvailableIn60Minutes}
          />
          <View style={styles.buttonRow}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  style={styles.photoDeleteBtn}
                  onPress={handleDelete}
                  disabled={isLoading}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    (!isFormValid() || isLoading) && styles.disabledBtn,
                    { flex: 1 },
                  ]}
                  onPress={handleDone}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.doneText}>Update Product</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    (!isFormValid() || isLoading) && styles.disabledBtn,
                  ]}
                  onPress={handleDone}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.doneText}>Add Product</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <CategorySelector
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={handleCategorySelect}
        loading={loadingCategories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",

    paddingTop: Platform.OS === "ios" ? StatusBar.currentHeight || 0 : 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FCFCFC",
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "General-Sans-Medium",
    // color: "#470A68",
    // textAlign: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  deleteText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#fff",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#470A68",
    height: 56,
    justifyContent: "center",
  },
  doneBtn: {
    flex: 1,
    backgroundColor: "#470A68",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
    height: 56,
    justifyContent: "center",
  },
  disabledBtn: {
    backgroundColor: "#555",
    opacity: 0.7,
  },
  cancelText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#470A68",
  },
  doneText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#fff",
  },
  photoDeleteBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#470A68",
    marginTop: 16,
  },
});
