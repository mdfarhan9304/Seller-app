import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../../components/Header";

import { useModal } from "@/contexts/ModalContext";
import { preferencesAPI, StoreMedia } from "../../../services/api";
import BannerLinkInput from "./banner-input";
interface Banner {
  id: string;
  uri: string;
  link?: string;
}

const Personalize = () => {
  const router = useRouter();
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerDeleting, setBannerDeleting] = useState(false);

  const MAX_BANNERS = 3;
  const { openModal } = useModal();
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getSellerPreferences();
      const prefs = response.preferences;

      if (prefs.logo && prefs.logo.url) {
        setLogoUri(prefs.logo.url);
      }

      if (prefs.banners && prefs.banners.length > 0) {
        const mappedBanners: Banner[] = prefs.banners.map(
          (banner: StoreMedia) => ({
            id: banner._id || banner.publicId,
            uri: banner.url,
            link: (banner as any).link, // Link may be stored separately
          })
        );
        setBanners(mappedBanners);
      }
    } catch (error: any) {
      console.error("Error loading personalization data:", error);
      if (
        error.message &&
        !String(error.message).includes("Preferences not found")
      ) {
        Alert.alert(
          "Error",
          "Failed to load personalization settings. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPreferences();
  }, []);

  // Pick logo image
  const pickLogo = async () => {
    if (logoUploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permission to upload photos"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        // Show local image immediately
        setLogoUri(selectedUri);
        try {
          setLogoUploading(true);
          const response = await preferencesAPI.updateLogo(selectedUri);
          setLogoUri(response.logo.url);
          Alert.alert("Success", "Logo updated successfully");
        } catch (err: any) {
          console.error("Error uploading logo:", err);
          const message =
            err.response?.data?.message ||
            err.message ||
            "Failed to upload logo. Please try again.";
          Alert.alert("Error", message);
        } finally {
          setLogoUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking logo:", error);
      Alert.alert("Error", "Failed to select logo. Please try again.");
    }
  };

  // Pick banner image
  const pickBanner = async () => {
    if (bannerUploading) return;

    if (banners.length >= MAX_BANNERS) {
      Alert.alert(
        "Banner Limit",
        `You can only add up to ${MAX_BANNERS} promo banners`
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUris = result.assets.map((asset) => asset.uri);
       
        const tempBanners: Banner[] = selectedUris.map((uri, index) => ({
          id: `temp-${Date.now()}-${index}`,
          uri: uri,
        }));
        const newBanners = [...banners, ...tempBanners];
        setBanners(newBanners);
        setActiveBannerIndex(newBanners.length - tempBanners.length);
        
        try {
          setBannerUploading(true);
          const response = await preferencesAPI.addBannerImage(selectedUris);
          const mappedBanners: Banner[] = response.banners.map(
            (banner: StoreMedia) => ({
              id: banner._id || banner.publicId,
              uri: banner.url,
            })
          );

          setBanners(mappedBanners);
          setActiveBannerIndex(mappedBanners.length - tempBanners.length);
          Alert.alert("Success", "Banner added successfully");
        } catch (err: any) {
          console.error("Error uploading banner:", err);
    
          setBanners(banners);
          const message =
            err.response?.data?.message ||
            err.message ||
            "Failed to upload banner. Please try again.";
          Alert.alert("Error", message);
        } finally {
          setBannerUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking banner:", error);
      Alert.alert("Error", "Failed to select banner. Please try again.");
    }
  };

  const linkBannerToProduct = async (banner: Banner) => {
    const link = await openModal(
      <BannerLinkInput defaultLink={banner.link || ""} />
    );
    if (link) {
      setBanners(banners.map((b) => (b.id === banner.id ? { ...b, link } : b)));
      // TODO: Implement banner link update API call when backend supports it
      await preferencesAPI.updateBannerLink(banner.id, link);
    }
  };

  // Remove banner
  const removeBanner = (id: string) => {
    if (bannerDeleting) return;

    Alert.alert(
      "Remove Banner",
      "Are you sure you want to remove this banner?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setBannerDeleting(true);
              const response = await preferencesAPI.deleteBannerImage(id);
              const mappedBanners: Banner[] = response.banners.map(
                (banner: StoreMedia) => ({
                  id: banner._id || banner.publicId,
                  uri: banner.url,
                })
              );
              setBanners(mappedBanners);

              if (
                activeBannerIndex >= mappedBanners.length &&
                mappedBanners.length > 0
              ) {
                setActiveBannerIndex(mappedBanners.length - 1);
              } else if (mappedBanners.length === 0) {
                setActiveBannerIndex(0);
              }

              Alert.alert("Success", "Banner removed successfully");
            } catch (err: any) {
              console.error("Error deleting banner:", err);
              Alert.alert(
                "Error",
                err.message || "Failed to delete banner. Please try again."
              );
            } finally {
              setBannerDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Navigate to previous banner
  const goToPreviousBanner = () => {
    if (banners.length === 0 || bannerDeleting) return;
    setActiveBannerIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  // Navigate to next banner
  const goToNextBanner = () => {
    if (banners.length === 0 || bannerDeleting) return;
    setActiveBannerIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  // Handle save
  const handleSave = () => {
    Alert.alert("Success", "Your personalization settings are up to date!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const isAnyOperationInProgress =
    logoUploading || bannerUploading || bannerDeleting;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#8D14CE", "#470A68"]} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Header title="Personalise" showBackButton={true} loading={loading} />

          <View style={styles.mainContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isAnyOperationInProgress}
            >
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#8D14CE" />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              )}

              {/* Content Card */}
              <View style={styles.card}>
                {/* Add Logo Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Store Logo</Text>
                  <TouchableOpacity
                    style={styles.logoContainer}
                    onPress={pickLogo}
                    activeOpacity={0.7}
                    disabled={logoUploading || isAnyOperationInProgress}
                  >
                    {logoUri ? (
                      <>
                        <Image
                          source={{ uri: logoUri }}
                          style={styles.logoImage}
                        />
                        {logoUploading && (
                          <View style={styles.logoLoadingOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.uploadingText}>
                              Uploading...
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        {logoUploading ? (
                          <>
                            <ActivityIndicator size="large" color="#8D14CE" />
                            <Text style={styles.logoPlaceholderText}>
                              Uploading...
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="camera-outline"
                              size={40}
                              color="#8D14CE"
                            />
                            <Text style={styles.logoPlaceholderText}>
                              Tap to add logo
                            </Text>
                          </>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Add Banners Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Store Banners</Text>

                  {banners.length > 0 ? (
                    <View style={styles.bannerCarouselContainer}>
                      <View style={styles.bannerWrapper}>
                        {/* Left Arrow */}
                        {banners.length > 1 && (
                          <TouchableOpacity
                            style={[styles.arrowButton, styles.leftArrow]}
                            onPress={goToPreviousBanner}
                            disabled={bannerDeleting || bannerUploading}
                          >
                            <Ionicons
                              name="chevron-back"
                              size={24}
                              color="#FFFFFF"
                            />
                          </TouchableOpacity>
                        )}

                        {/* Banner Display */}
                        <Pressable
                          style={styles.bannerImageContainer}
                          onPress={() =>
                            !banners[activeBannerIndex].id.startsWith('temp-') &&
                            linkBannerToProduct(banners[activeBannerIndex])
                          }
                        >
                          <Image
                            source={{ uri: banners[activeBannerIndex].uri }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                          />

                          {/* Loading Overlay for Banner Upload */}
                          {bannerUploading && banners[activeBannerIndex].id.startsWith('temp-') && (
                            <View style={styles.bannerLoadingOverlay}>
                              <ActivityIndicator size="large" color="#FFFFFF" />
                              <Text style={styles.uploadingText}>
                                Uploading...
                              </Text>
                            </View>
                          )}

                          {/* Loading Overlay for Banner Delete */}
                          {bannerDeleting && (
                            <View style={styles.bannerLoadingOverlay}>
                              <ActivityIndicator size="large" color="#FFFFFF" />
                              <Text style={styles.uploadingText}>
                                Deleting...
                              </Text>
                            </View>
                          )}

                          {/* Remove Button */}
                          {!bannerDeleting && !bannerUploading && !banners[activeBannerIndex].id.startsWith('temp-') && (
                            <TouchableOpacity
                              style={styles.removeBannerButton}
                              onPress={() =>
                                removeBanner(banners[activeBannerIndex].id)
                              }
                              disabled={isAnyOperationInProgress}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={24}
                                color="#8D14CE"
                              />
                            </TouchableOpacity>
                          )}

                          {/* Edit Link Button */}
                          {!banners[activeBannerIndex].id.startsWith('temp-') && (
                            <TouchableOpacity
                              style={styles.editLinkButton}
                              onPress={() =>
                                linkBannerToProduct(banners[activeBannerIndex])
                              }
                            >
                              <Ionicons
                                name="link-outline"
                                size={24}
                                color="#8D14CE"
                              />
                            </TouchableOpacity>
                          )}
                        </Pressable>

                        {/* Right Arrow */}
                        {banners.length > 1 && (
                          <TouchableOpacity
                            style={[styles.arrowButton, styles.rightArrow]}
                            onPress={goToNextBanner}
                            disabled={bannerDeleting || bannerUploading}
                          >
                            <Ionicons
                              name="chevron-forward"
                              size={24}
                              color="#FFFFFF"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Indicator Dots */}
                      {banners.length > 1 && (
                        <View style={styles.dotsContainer}>
                          {banners.map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.dot,
                                index === activeBannerIndex && styles.activeDot,
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyBannerContainer}>
                      {bannerUploading ? (
                        <View style={styles.addFirstBannerButton}>
                          <ActivityIndicator size="large" color="#8D14CE" />
                          <Text style={styles.addFirstBannerText}>
                            Uploading banner...
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addFirstBannerButton}
                          onPress={pickBanner}
                          disabled={isAnyOperationInProgress}
                        >
                          <Ionicons
                            name="image-outline"
                            size={40}
                            color="#8D14CE"
                          />
                          <Text style={styles.addFirstBannerText}>
                            Tap to add your first banner
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Banner Info and Add More */}
                  <View style={styles.bannerFooter}>
                    <Text style={styles.bannerInfoText}>
                      You can add upto {MAX_BANNERS} promo banners.
                    </Text>
                    
                    {banners.length < MAX_BANNERS && banners.length > 0 && (
                      <TouchableOpacity
                        onPress={pickBanner}
                        disabled={bannerUploading || isAnyOperationInProgress}
                      >
                        <Text
                          style={[
                            styles.addMoreText,
                            (bannerUploading || isAnyOperationInProgress) &&
                              styles.addMoreTextDisabled,
                          ]}
                        >
                          {bannerUploading ? "Uploading..." : "+ Add more"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.bannerInfoText}>
                    Size:  1600px x 900px
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isAnyOperationInProgress && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isAnyOperationInProgress}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Personalize;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 20,
  },
  loadingText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "#000000",
    marginTop: 12,
  },
  headerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  gradient: {
    flex: 1,
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.4)",
    marginTop: 8,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },
  logoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 70,
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(141, 20, 206, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "#8D14CE",
    marginTop: 8,
  },
  uploadingText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
  },
  bannerCarouselContainer: {
    marginBottom: 16,
  },
  bannerWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0F0F0",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  bannerLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  removeBannerButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  editLinkButton: {
      position: "absolute",
      top: 12,
      right: 54,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  activeDot: {
    backgroundColor: "#8D14CE",
    width: 24,
  },
  emptyBannerContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "rgba(141, 20, 206, 0.05)",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  addFirstBannerButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addFirstBannerText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "#8D14CE",
    marginTop: 8,
  },
  bannerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  bannerInfoText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.6)",
    marginBottom: 4
  },
  addMoreText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  addMoreTextDisabled: {
    color: "rgba(0, 122, 255, 0.4)",
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#F9D423",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
});
