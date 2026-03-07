import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { height, width } = Dimensions.get('window');

const UnderReviewScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const lastCheckRef = useRef(0);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkStatus = async () => {
    // Prevent re-entry and rapid consecutive checks
    if (inFlightRef.current) return;
    const now = Date.now();
    if (now - lastCheckRef.current < 1500) return;

    inFlightRef.current = true;
    lastCheckRef.current = now;
    if (isMountedRef.current) setIsCheckingStatus(true);

    try {
      // Read seller data from AsyncStorage
      const sellerData = await AsyncStorage.getItem('seller_data');
      const token = await AsyncStorage.getItem('auth_cookies');

      if (!token) {
        await logout();
        router.replace('/');
        return;
      }

      if (sellerData) {
        const seller = JSON.parse(sellerData);
        const sellerApproved = seller?.sellerApproved;
        const sellerStatus = seller?.sellerStatus;

        console.log("Seller approved:", sellerApproved, "Seller status:", sellerStatus);

        if (sellerApproved === true || sellerStatus === 'APPROVED') {
          console.log("✅ Seller is approved, navigating to home...");
          router.replace('/(tabs)/home');
          return;
        }
        
        console.log("❌ Seller still under review");
      } else {
        // No seller data, might need to continue onboarding
        console.log("No seller data found");
      }
    } catch (error: any) {
      console.error('Error reading from AsyncStorage:', error);
      
      // If token is invalid or missing, logout
      const token = await AsyncStorage.getItem('auth_cookies');
      if (!token) {
        try {
          await logout();
          router.replace('/');
        } catch (logoutError) {
          console.error('Logout error:', logoutError);
          router.replace('/');
        }
        return;
      }
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) setIsCheckingStatus(false);
    }
  };

  // ✅ Check status only once when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      checkStatus();
      return () => { isMountedRef.current = false; };
    }, [])
  );

  return (
    <LinearGradient colors={["#470A68", "#8D14CE"]} style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/unicapp-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={80} color="#F3E545" />
          </View>
          
          <Text style={styles.title}>Account Under Review</Text>
          
          <Text style={styles.description}>
            Your seller account is currently being reviewed by our team. 
            This process usually takes 24-48 hours.
          </Text>
          
          <Text style={styles.subDescription}>
            We'll automatically check your status and redirect you once approved.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#F3E545" />
            <Text style={styles.infoText}>
              Make sure your phone number is active to receive approval notifications.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          {isCheckingStatus && (
            <View style={styles.checkingStatusContainer}>
              <Text style={styles.checkingStatusText}>Checking your status...</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Filson-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'General-Sans-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  subDescription: {
    fontSize: 14,
    fontFamily: 'General-Sans-Regular',
    color: '#FFFFFF80',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'General-Sans-Regular',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingBottom: 40,
    gap: 12,
  },
  checkStatusButton: {
    backgroundColor: '#F3E545',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  checkStatusButtonText: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000000',
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#FFFFFF',
  },
  checkingStatusContainer: {
    backgroundColor: '#F3E54520',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkingStatusText: {
    fontSize: 14,
    fontFamily: 'General-Sans-Medium',
    color: '#F3E545',
  },
});

export default UnderReviewScreen;
