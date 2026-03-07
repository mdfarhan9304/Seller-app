import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { extractAddressDetails } from "./location";

const GOOGLE_PLACES_API_KEY = "AIzaSyAHoCHhp2PXw0MpwCgEU7ojjKb0diF_LCM";
// import { useAuth } from "../../contexts/AuthContext"; // Available for future use

const { width, height } = Dimensions.get("window");

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
  pincode: string;
}

const LocationSearch = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([] as Place[]);
  const [address, setAddress] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sample suggested locations - Updated to match Figma design
  const suggestedLocations = [
    {
      id: "current",
      text: "123, Anything Street, Your City, n...",
      isCurrent: true,
    },
    {
      id: "1",
      text: "Anything Apt, Khakar Ali Road, Ne",
      isCurrent: false,
    },
    {
      id: "2",
      text: "D-63, Anything Market-1, Phase-2,",
      isCurrent: false,
    },
    {
      id: "3",
      text: "A1/25, Anything Co-op Society, Nr.",
      isCurrent: false,
    },
    {
      id: "4",
      text: "Anything Restaurant",
      isCurrent: false,
    },
    {
      id: "5",
      text: "Anything Bar",
      isCurrent: false,
    },
    {
      id: "6",
      text: "Anything Grocery Store",
      isCurrent: false,
    },
  ];

  const handleSearch = (text: string) => {
    setAddress(text);
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text || text.length < 3) {
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
        const places: any[] = suggestions.map((suggestion: any) => ({
          placeId: suggestion.placePrediction.placeId,
          text: suggestion.placePrediction.text.text,
          mainText:
            suggestion.placePrediction.structuredFormat?.mainText?.text || "",
          secondaryText:
            suggestion.placePrediction.structuredFormat?.secondaryText?.text ||
            "",
        }));

        const mappedPlaces: Place[] = places.map((place: any) => ({
          id: place.placeId,
          name: place.mainText || place.text,
          address: place.text,
          fullAddress: place.text,
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
          type: "place",
          context: {
            locality: place.secondaryText || "",
            district: "",
            state: "",
            postcode: "",
          },
        }));

        setSearchResults(mappedPlaces);
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
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleLocationSelect = async (place: Place) => {
    try {
      setIsSearching(true);

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

      console.log("formattedAddress", {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        address: formattedAddress,
        locality: place.context.locality || "",
        city: addressDetails.city || "",
        state: addressDetails.state || "",
        pincode: addressDetails.pincode || "",
        landmark: addressDetails.landmark || "",
      });
      router.push({
        pathname: "/location",
        params: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          address: formattedAddress,
          locality: place.context.locality || "",
          city: addressDetails.city || "",
          state: addressDetails.state || "",
          pincode: addressDetails.pincode || "",
          landmark: addressDetails.landmark || "",
        },
      });
    } catch (error) {
      console.error("Error getting place details:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlemapclick = () => {
    // When clicking "Select on map", we'll use default coordinates (Delhi) initially
    router.push({
      pathname: "/location",
      params: {
        latitude: "28.6139",
        longitude: "77.2090",
        address: "",
        isFromMap: "true",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.mainContainer}>
        <View style={styles.arrowContainer}>
          <TouchableOpacity
            onPress={() => router.replace("/onboard")}
            style={{
              width: 24,
              height: 26,
              borderRadius: 20,
              backgroundColor: "#0000000A",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>

          <Text style={styles.header}>Set store location</Text>
        </View>
        <TouchableOpacity onPress={handlemapclick}>
          <Text style={{ fontFamily: "General-Sans-Medium", color: "#5390F4" }}>
            Select on map
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 24 }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, street name..."
          placeholderTextColor="#666"
          onChangeText={handleSearch}
          value={address}
        />

        {isSearching && (
          <ActivityIndicator
            style={styles.searchSpinner}
            size="small"
            color="#470A68"
          />
        )}

        {searchResults.length > 0 && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.searchResults}
          >
            {searchResults.map((place, index) => (
              <TouchableOpacity
                key={`${place.id}-${index}`}
                style={styles.searchResultItem}
                onPress={() => handleLocationSelect(place)}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color="#8D14CE"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultName}>{place.name}</Text>
                  <Text style={styles.searchResultAddress}>
                    {place.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    paddingHorizontal: 24,
  },
  header: {
    fontFamily: "Filson-Bold",
    fontSize: 16,
  },
  arrowContainer: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  searchInput: {
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "General-Sans-Regular",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 5,
    marginTop: 20,
  },
  searchSpinner: {
    position: "absolute",
    right: 32,
    top: 32,
  },
  searchResults: {
    maxHeight: height * 0.6,
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row"
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
});

export default LocationSearch;
