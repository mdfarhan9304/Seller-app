import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8D14CE" />
      <LinearGradient colors={['#8D14CE', '#470A68']} style={styles.header}>
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Detail</Text>
          <View style={{ width: 24 }} />
        </SafeAreaView>
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        <View style={styles.productImageContainer}>
          <View style={styles.productImagePlaceholder} />
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>Product {id}</Text>
          <Text style={styles.productPrice}>₹999</Text>
          <Text style={styles.productDescription}>
            This is a sample product description. Add details about your product here.
            Include information like material, size, color, etc.
          </Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EDEA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'General-Sans-Medium',
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  productInfo: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  productTitle: {
    fontFamily: 'General-Sans-Medium',
    fontSize: 24,
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontFamily: 'General-Sans-Medium',
    fontSize: 18,
    color: '#8D14CE',
    marginBottom: 15,
  },
  productDescription: {
    fontFamily: 'General-Sans-Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#F3E545',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontFamily: 'General-Sans-Medium',
    fontSize: 16,
    color: '#000',
  },
}); 