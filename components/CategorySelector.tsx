import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  isActive: boolean;
}

interface CategorySelectorProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (category: Category) => void;
  loading?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Category</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategoryId === item._id && styles.selectedCategoryItem
              ]}
              onPress={() => {
                onSelectCategory(item);
                onClose();
              }}
            >
              <View style={styles.categoryContent}>
                <View style={[
                  styles.categoryIconContainer,
                  selectedCategoryId === item._id && styles.selectedCategoryIcon
                ]}>
                  <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
                </View>
                <Text style={[
                  styles.categoryText,
                  selectedCategoryId === item._id && styles.selectedCategoryText
                ]}>
                  {item.name}
                </Text>
              </View>
              {selectedCategoryId === item._id && (
                <Ionicons name="checkmark-circle" size={24} color="#470A68" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#470A68" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading categories...</Text>
              </View>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No categories available</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'General-Sans-Medium',
    color: '#470A68',
    textAlign: 'center',
    flex: 1,
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryItem: {
    borderWidth: 1,
    borderColor: '#470A68',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(71, 10, 104, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedCategoryIcon: {
    backgroundColor: '#470A68',
  },
  categoryIcon: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    // top: 8,
    // left: 8
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#470A68',
    fontWeight: '600',
  },
});

