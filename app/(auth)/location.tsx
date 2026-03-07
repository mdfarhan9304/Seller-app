import HeaderPage from "@/components/ui/HeaderPage";
import axios from "axios";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../../contexts/AuthContext";

const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
  "AIzaSyAHoCHhp2PXw0MpwCgEU7ojjKb0diF_LCM";

const { height, width } = Dimensions.get("window");

export const extractAddressDetails = (components?: any[]) => {
  if (!components || !Array.isArray(components)) {
    return { city: "", state: "", pincode: "", landmark: "" };
  }

  const getComponent = (...types: string[]) =>
    components.find((comp) => types.some((type) => comp.types?.includes(type)));

  const getText = (component?: any) =>
    component?.longText ||
    component?.shortText ||
    component?.long_name ||
    component?.short_name ||
    "";

  const cityComponent =
    getComponent("locality") ||
    getComponent("administrative_area_level_2") ||
    getComponent("postal_town");
  const stateComponent = getComponent("administrative_area_level_1");
  const postalComponent = getComponent("postal_code");
  const landmarkComponent =
    getComponent("sublocality") ||
    getComponent("sublocality_level_1") ||
    getComponent("neighborhood");

  return {
    city: getText(cityComponent),
    state: getText(stateComponent),
    pincode: getText(postalComponent),
    landmark: getText(landmarkComponent),
  };
};

interface Place {
  id: string;
  name: string;
  address: string;
  fullAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: string;
  context: {
    locality: string;
    district: string;
    state: string;
    postcode: string;
  };
}

interface Address {
  full: string;
  landmark?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pincode?: string;
  city?: string;
  state?: string;
}

const Map = () => {
  const [address, setAddress] = useState("");
  const [floor, setFloor] = useState("");
  const [building, setBuilding] = useState("");
  const [landmark, setLandmark] = useState("");
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const floorInputRef = useRef<TextInput>(null);
  const buildingInputRef = useRef<TextInput>(null);
  const landmarkInputRef = useRef<TextInput>(null);
  const formContainerRef = useRef<View>(null);
  const rowContainerRef = useRef<View>(null);
  const { updateSellerLocation } = useAuth();
  const {
    latitude,
    longitude,
    address: initialAddress,
    locality,
    isFromMap,
  } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    address: string;
    locality: string;
    isFromMap: string;
  }>();
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: latitude ? parseFloat(latitude) : 28.6139,
    longitude: longitude ? parseFloat(longitude) : 77.209,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    latitude && longitude
      ? {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }
      : null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { firstName, lastName, email } = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
  }>();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null!);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleInputFocus = (inputName: "floor" | "building" | "landmark") => {
    setTimeout(
      () => {
        let containerRef: React.RefObject<View | null> | null = null;

        switch (inputName) {
          case "floor":
          case "building":
            containerRef = rowContainerRef;
            break;
          case "landmark":
            containerRef = formContainerRef;
            break;
        }

        if (containerRef && containerRef.current && scrollViewRef.current) {
          containerRef.current.measureInWindow((x, y, width, height) => {
            // Scroll to position the input near the top of visible area
            const scrollOffset = Math.max(0, y - 200);
            scrollViewRef.current?.scrollTo({
              y: scrollOffset,
              animated: true,
            });
          });
        }
      },
      Platform.OS === "ios" ? 100 : 300
    );
  };

  const registerUser = () => {
    console.log("selectedAddress", selectedAddress);
    // Save location data to global auth state
    const locationData = {
      floor: floor || "",
      buildingName: building || "",
      landmark: landmark || selectedAddress?.landmark || "",
      latitude: selectedLocation?.latitude || currentLocation?.latitude || 0,
      longitude: selectedLocation?.longitude || currentLocation?.longitude || 0,
      address: selectedAddress?.full || address || "",
      city: selectedAddress?.city || "",
      state: selectedAddress?.state || "",
      pincode: selectedAddress?.pincode || "",
    };

    updateSellerLocation(locationData);

    // Navigate to UPI Payment screen
    router.push("/UPIPayment");
  };

  useEffect(() => {
    console.log("initialAddress", initialAddress);
    if (initialAddress) {
      setAddress(initialAddress);
    }
    if (locality) {
      setLandmark(locality);
    }
  }, [initialAddress, locality]);

  // Get current location only if not coming from search and no location selected
  useEffect(() => {
    const shouldGetCurrentLocation =
      !selectedLocation && !isFromMap && !latitude && !longitude;

    if (shouldGetCurrentLocation) {
      const getLocation = async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            console.log("Permission to access location was denied");
            setIsLocationLoading(false);
            return;
          }

          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const currentCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(currentCoords);
          setSelectedLocation(currentCoords);

          const newRegion = {
            ...currentCoords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setMapRegion(newRegion);

          // Animate to current location
          mapRef.current?.animateToRegion(newRegion, 5000);

          // Get address for current location
          handleReverseGeocode(currentCoords);
        } catch (error) {
          console.error("Error getting location:", error);
        } finally {
          setIsLocationLoading(false);
        }
      };

      getLocation();
    } else {
      setIsLocationLoading(false);
    }
  }, [isFromMap, latitude, longitude, selectedLocation]);

  // Custom debounced search function
  const debouncedSearch = useCallback(
    async (text: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!text) {
        setSearchResults([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          const response = await axios.post(
            "https://places.googleapis.com/v1/places:autocomplete",
            {
              input: text,
              includedPrimaryTypes: [
                "establishment",
                "point_of_interest",
                "tourist_attraction",
                "premise",
                "street_address",
              ],
              languageCode: "en",
              regionCode: "IN",
              includedRegionCodes: ["IN"],
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                "X-Goog-FieldMask": "suggestions.placePrediction",
              },
            }
          );

          const suggestions = response.data?.suggestions || [];
          const places: Place[] = suggestions.map((suggestion: any) => {
            const prediction = suggestion.placePrediction;
            return {
              id: prediction.placeId,
              name:
                prediction.structuredFormat?.mainText?.text ||
                prediction.text.text,
              address: prediction.text.text,
              fullAddress: prediction.text.text,
              coordinates: {
                latitude: 0, // Will be fetched on select
                longitude: 0,
              },
              type: prediction.types?.[0] || "place",
              context: {
                locality: "",
                district: "",
                state: "",
                postcode: "",
              },
            };
          });

          setSearchResults(places);
        } catch (error: any) {
          console.error("Search error:", error);
          if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
            console.error(
              "Error Data:",
              JSON.stringify(error.response.data, null, 2)
            );
            console.error("Error Headers:", error.response.headers);
          }
          if (error.request) {
            console.error("Request:", error.request);
          }
          console.error("Error Message:", error.message);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    },
    [currentLocation]
  );

  const handleSearch = (text: string) => {
    setAddress(text);
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleLocationSelect = async (place: Place) => {
    try {
      setIsSearching(true);

      if (!place.id) {
        console.error("No place ID");
        return;
      }

      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${place.id}`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask":
              "id,displayName,formattedAddress,location,addressComponents",
          },
        }
      );

      const details = response.data;
      const latitude = details.location?.latitude || 0;
      const longitude = details.location?.longitude || 0;
      const formattedAddress = details.formattedAddress || place.fullAddress;
      const addressDetails = extractAddressDetails(
        details.addressComponents || []
      );
      console.log("addressDetails", addressDetails);

      setSelectedLocation({ latitude, longitude });
      setAddress(formattedAddress);
      if (!landmark && addressDetails.landmark) {
        setLandmark(addressDetails.landmark);
      }
      setSelectedAddress({
        full: formattedAddress,
        coordinates: { latitude, longitude },
        pincode: addressDetails.pincode,
        landmark: addressDetails.landmark || landmark || "",
        city: addressDetails.city,
        state: addressDetails.state,
      });

      const updatedPlace = {
        ...place,
        coordinates: { latitude, longitude },
        fullAddress: formattedAddress,
      };

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 5000);
      setSearchResults([]);
    } catch (error) {
      console.error("Error getting place details:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding using Google Places API
  // Reverse geocoding using Google Geocoding API (same as customer-app)
  const handleReverseGeocode = async (coordinates: {latitude: number, longitude: number}) => {
    try {
      setIsReverseGeocoding(true);
      
      // Use Geocoding API directly (same approach as customer-app)
      const reverseResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${coordinates.latitude},${coordinates.longitude}`,
            key: GOOGLE_PLACES_API_KEY,
            language: "en",
            result_type: "street_address|route|subpremise|premise|administrative_area_level_2|administrative_area_level_1",
          },
        }
      );

      if (reverseResponse.data?.results?.length > 0) {
        const result = reverseResponse.data.results[0];
        const formattedAddress = result.formatted_address || "";
        const details = extractAddressDetails(result.address_components || []);
        setAddress(formattedAddress);
        setSelectedAddress({
          full: formattedAddress,
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
          pincode: details.pincode,
          landmark: details.landmark,
          city: details.city,
          state: details.state,
        });
        if (!landmark && details.landmark) {
          setLandmark(details.landmark);
        }
      } else {
        console.warn("No address found for coordinates:", coordinates);
      }

      setSearchResults([]);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(newRegion);
    handleReverseGeocode({ latitude, longitude });
  };

  return (
    <HeaderPage title="Set your default location">
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description={address || "Selected location"}
            />
          )}
        </MapView>
        {isLocationLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#470A68" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.bottomSheetKAV,
          {
            bottom:
              Platform.OS === "ios"
                ? 0
                : keyboardHeight > 0
                ? keyboardHeight
                : 0,
            maxHeight:
              keyboardHeight > 0
                ? Math.min(height * 0.85, height - keyboardHeight + 100)
                : height * 0.7,
          },
        ]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.bottomSheetScrollView}
          contentContainerStyle={styles.bottomSheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Addresses"
              value={address}
              onChangeText={handleSearch}
              placeholderTextColor="#666"
            />
            {isSearching && (
              <ActivityIndicator
                style={styles.searchSpinner}
                size="small"
                color="#470A68"
              />
            )}
          </View>

          {searchResults.length > 0 && (
            <ScrollView
              style={styles.searchResults}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.searchResultItem}
                  onPress={() => handleLocationSelect(place)}
                >
                  <Text style={styles.searchResultName}>{place.name}</Text>
                  <Text style={styles.searchResultAddress}>
                    {place.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.formContainer} ref={formContainerRef}>
            <View style={styles.rowContainer} ref={rowContainerRef}>
              <TextInput
                ref={floorInputRef}
                style={[styles.input, styles.floorInput]}
                placeholder="Floor *"
                value={floor}
                onChangeText={setFloor}
                placeholderTextColor="#666"
                onFocus={() => handleInputFocus("floor")}
              />
              <TextInput
                ref={buildingInputRef}
                style={[styles.input, styles.buildingInput]}
                placeholder="Building name/no *"
                value={building}
                onChangeText={setBuilding}
                placeholderTextColor="#666"
                onFocus={() => handleInputFocus("building")}
              />
            </View>

            <TextInput
              ref={landmarkInputRef}
              style={[styles.input, styles.landmarkInput]}
              placeholder="Landmark (If any)"
              value={landmark}
              onChangeText={setLandmark}
              placeholderTextColor="#666"
              onFocus={() => handleInputFocus("landmark")}
            />

            <TouchableOpacity
              style={[
                styles.button,
                (!selectedLocation ||
                  !address ||
                  !floor.trim() ||
                  !building.trim()) &&
                  styles.buttonDisabled,
              ]}
              onPress={registerUser}
              disabled={
                !selectedLocation ||
                !address ||
                !floor.trim() ||
                !building.trim()
              }
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </HeaderPage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  mainContentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginTop: 50,
    // paddingBottom: 20,
    marginLeft: 20,
    fontFamily: "Filson-Bold",
    color: "white",
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#470A68",
    fontFamily: "General-Sans-Regular",
  },
  bottomSheetKAV: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  bottomSheetScrollView: {
    flex: 1,
  },
  bottomSheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 10,
  },
  searchInput: {
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 40,
    fontSize: 16,
    fontFamily: "General-Sans-Regular",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchSpinner: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  searchResults: {
    maxHeight: 150,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchResultName: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#333",
    marginBottom: 4,
  },
  searchResultAddress: {
    fontSize: 14,
    fontFamily: "General-Sans-Regular",
    color: "#666",
  },
  formContainer: {
    gap: 15,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "General-Sans-Regular",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  floorInput: {
    flex: 1,
    minWidth: 100,
  },
  buildingInput: {
    flex: 2,
  },
  landmarkInput: {
    backgroundColor: "#f5f5f5",
  },
  button: {
    backgroundColor: "#F3E545",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#F3E54580",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "General-Sans-Bold",
    color: "#000",
  },
});

export default Map;
