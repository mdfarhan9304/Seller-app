import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  selectedCategory?: string | null;
};

export const SearchFilterBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  onFilterPress,
  selectedCategory,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="done"
        />
      </View>
      <TouchableOpacity
        style={[styles.filterButton, selectedCategory ? styles.filterButtonActive : null]}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterButtonText, selectedCategory ? styles.filterButtonTextActive : null]}>
          Filter
        </Text>
        <Ionicons
          name="options-outline"
          size={18}
          color={selectedCategory ? "#8D14CE" : "#333"}
        />
        {selectedCategory ? <View style={styles.activeDot} /> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontFamily: "General-Sans-Regular",
    color: "#000",
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  filterButtonActive: {
    backgroundColor: "rgba(141, 20, 206, 0.06)",
    borderColor: "#8D14CE",
  },
  filterButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#8D14CE",
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8D14CE",
  },
});
