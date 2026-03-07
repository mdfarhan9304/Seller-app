import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useModal } from "@/contexts/ModalContext";

type Category = {
  _id: string;
  name: string;
};

type ListItem = {
  _id: string | null;
  name: string;
};

type Props = {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export const FilterModal: React.FC<Props> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { closeModal } = useModal();

  const handleSelect = (id: string | null) => {
    onSelectCategory(id);
    closeModal();
  };

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter by Category</Text>
      </View>

      <FlatList<ListItem>
        data={[{ _id: null, name: "All Categories" }, ...categories]}
        keyExtractor={(item) => item._id ?? "__all__"}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isAll = item._id === null;
          const isSelected = isAll
            ? !selectedCategory
            : selectedCategory === item._id;
          return (
            <TouchableOpacity
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handleSelect(isAll ? null : item._id)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {item.name}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#8D14CE"
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 8,
  },
  title: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    color: "#1A1A1A",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "rgba(141, 20, 206, 0.06)",
  },
  optionText: {
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    fontFamily: "General-Sans-Medium",
    color: "#8D14CE",
  },
});
