import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface PhotoItem {
  id: string;
  uri: string;
}

interface PhotoPickerProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}) => {
  const validateImage = async (
    uri: string
  ): Promise<{ valid: boolean; error?: string }> => {
    try {
      if (!uri || !uri.startsWith("file://")) {
        return { valid: false, error: "Invalid image file" };
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Failed to validate image" };
    }
  };

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Image Limit",
        `You can only add up to ${maxPhotos} images per product`
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permission to upload photos"
      );
      return;
    }

    try {
      const remainingSlots = maxPhotos - photos.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== "ios",
        aspect: Platform.OS !== "ios" ? [1, 1] : undefined,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots > 0 ? remainingSlots : 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos: PhotoItem[] = [];
        const remainingSlots = maxPhotos - photos.length;
        const assetsToProcess = result.assets.slice(0, remainingSlots);

        for (const asset of assetsToProcess) {
          const validation = await validateImage(asset.uri);
          if (!validation.valid) continue;

          const isDuplicate = photos.some((photo) => photo.uri === asset.uri);
          if (isDuplicate) continue;

          newPhotos.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            uri: asset.uri,
          });
        }

        if (newPhotos.length === 0) {
          Alert.alert(
            "Notice",
            "No new valid images were added. They may be duplicates or invalid."
          );
          return;
        }

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            "Image Limit",
            `Only ${remainingSlots} images were added (max ${maxPhotos} total)`
          );
        }

        onPhotosChange([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const removePhoto = (id: string) => {
    onPhotosChange(photos.filter((photo) => photo.id !== id));
  };

  const handlePhotoPress = async (photo: PhotoItem) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        selectionLimit: 1, // single select to enable cropping
        presentationStyle:
          Platform.OS === "ios"
            ? ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
            : undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const validation = await validateImage(uri);
        if (!validation.valid) {
          Alert.alert("Error", validation.error || "Invalid image");
          return;
        }

        const updatedPhotos = photos.map((p) =>
          p.id === photo.id
            ? {
                ...p,
                uri,
              }
            : p
        );
        onPhotosChange(updatedPhotos);
      }
    } catch (error) {
      console.error("Error editing image:", error);
      Alert.alert("Error", "Failed to edit image. Please try again.");
    }
  };

  const handleDragEnd = ({ data }: { data: PhotoItem[] }) => {
    onPhotosChange(data);
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === "add" && photos.length < maxPhotos) {
      return (
        <View style={styles.photoItem}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
            <Ionicons name="add" size={32} color="#470A68" />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      // <ScaleDecorator>
      <TouchableOpacity
        // onLongPress={drag}
        // delayLongPress={150}
        style={[
          styles.photoItem,

          // isActive && styles.photoItemActive
        ]}
        activeOpacity={0.7}
        onPress={() => handlePhotoPress(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.photoImage} />
        <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              removePhoto(item.id);
              // if (!isActive) {
              // }
            }}
            // disabled={isActive}
          >
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        {/* {isActive && (
            <View style={styles.dragIndicator}>
              <Ionicons name="reorder-two-outline" size={20} color="#8D14CE" />
            </View>
          )} */}
      </TouchableOpacity>
      // </ScaleDecorator>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Add photos</Text>
      <View style={styles.photoContainer}>
        <FlatList
          data={[
            ...photos,
            {
              id: "add",
            },
          ]}
          // onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          scrollEnabled={false}
          // contentContainerStyle={styles.draggableList}
          columnWrapperStyle={styles.columnWrapper}
          // activationDistance={15}
          // dragItemOverflow={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
  },
  photoContainer: {
    marginTop: 8,
    // backgroundColor: "green",
  },
  columnWrapper: {
    flex: 1,
    // width: "10%",
    marginBottom: 8,
    // backgroundColor: "blue",
    gap: 8,
  },
  photoList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photoItem: {
    flex: 1 / 3,
    // backgroundColor: "red",
    aspectRatio: 1,
    borderRadius: 8,
    // position: "relative",
    // overflow: "visible",
  },
  photoItemActive: {
    opacity: 0.8,
    // transform: [{ scale: 1.05 }],
  },
  dragIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  deleteBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#8D14CE",
    borderRadius: 12,
    zIndex: 1,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    // width: 90,
    // height: 90,
    width: "100%",
    height: "100%",
    // aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "rgba(141, 20, 206, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoHint: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "rgba(0,0,0,0.25)",
    marginTop: 12,
  },
});
