
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { authAPI, PaymentOptions, preferencesAPI, RegistrationData, SellerLocation } from '../services/api';

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  seller: any | null;
  store: any | null;
  sellerPreferences: any | null;
  token: string | null;
  registrationData: Partial<RegistrationData>;
  subdomain: string | null;
}

// Auth context interface
interface AuthContextType {
  authState: AuthState;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  updateSellerLocation: (location: SellerLocation) => void;
  updatePaymentOptions: (payment: PaymentOptions) => void;
  clearRegistrationData: () => void;
  sendOTP: (phoneNumber: string, role?: 'SELLER' | 'USER' | 'RIDER' | 'ADMIN') => Promise<any>;
  verifyOTP: (phoneNumber: string, totp: string, verificationId: string) => Promise<any>;
  registerSeller: (paymentData?: PaymentOptions) => Promise<any>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setToken: (token: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSellerPreferences: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true, 
    user: null,
    seller: null,
    store: null,
    sellerPreferences: null,
    token: null,
    registrationData: {},
    subdomain: null,
  });
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Initialize auth state on app start
  const initializeAuth = async () => {
    // Prevent multiple simultaneous calls
    if (isInitializingRef.current) {
      console.log('initializeAuth already in progress, skipping...');
      return;
    }
    
    // Allow re-initialization only if not already initialized (for refresh scenarios)
    if (hasInitializedRef.current && authState.isAuthenticated) {
      console.log('Auth already initialized, skipping...');
      return;
    }
    
    try {
      isInitializingRef.current = true;
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const token = await AsyncStorage.getItem('auth_cookies');

      if (token) {
        try {
          // Read user, seller, and store data from AsyncStorage
          const [userData, sellerData, storeData] = await Promise.all([
            AsyncStorage.getItem('user_data'),
            AsyncStorage.getItem('seller_data'),
            AsyncStorage.getItem('store_data'),
          ]);
          
          if (userData) {
            const user = JSON.parse(userData);
            const seller = sellerData ? JSON.parse(sellerData) : null;
            const store = storeData ? JSON.parse(storeData) : null;
            const sellerPreferencesData = await AsyncStorage.getItem('seller_preferences');
            const sellerPreferences = sellerPreferencesData ? JSON.parse(sellerPreferencesData) : null;
            const subdomain = store?.subdomain || seller?.subdomain || user?.subdomain || null;
            
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: user,
              seller: seller,
              store: store,
              sellerPreferences: sellerPreferences,
              token,
              registrationData: {},
              subdomain: subdomain,
            });
            hasInitializedRef.current = true;
            console.log('Auth state updated from AsyncStorage');
          } else {
            // No user data found, clear everything
            await Promise.all([
              AsyncStorage.removeItem('auth_cookies'),
              AsyncStorage.removeItem('user_data'),
              AsyncStorage.removeItem('seller_data'),
              AsyncStorage.removeItem('store_data'),
              AsyncStorage.removeItem('seller_preferences'),
            ]);
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              seller: null,
              store: null,
              sellerPreferences: null,
              token: null,
              registrationData: {},
              subdomain: null,
            });
            hasInitializedRef.current = true;
          }
        } catch (storageError) {
          console.error('Error reading from AsyncStorage:', storageError);
          await Promise.all([
            AsyncStorage.removeItem('auth_cookies'),
            AsyncStorage.removeItem('user_data'),
            AsyncStorage.removeItem('seller_data'),
            AsyncStorage.removeItem('store_data'),
          ]);
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            seller: null,
            store: null,
            sellerPreferences: null,
            token: null,
            registrationData: {},
            subdomain: null,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          seller: null,
          store: null,
          sellerPreferences: null,
          token: null,
          registrationData: {},
          subdomain: null,
        });
        hasInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        seller: null,
        store: null,
        sellerPreferences: null,
        token: null,
        registrationData: {},
        subdomain: null,
      });
      hasInitializedRef.current = true;
    } finally {
      isInitializingRef.current = false;
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setAuthState(prev => ({
      ...prev,
      registrationData: {
        ...prev.registrationData,
        ...data,
      },
    }));
  };

  const updateSellerLocation = (location: SellerLocation) => {
    setAuthState(prev => ({
      ...prev,
      registrationData: {
        ...prev.registrationData,
        sellerLocation: location,
      },
    }));
  };

  const updatePaymentOptions = (payment: PaymentOptions) => {
    setAuthState(prev => ({
      ...prev,
      registrationData: {
        ...prev.registrationData,
        paymentOptions: payment,
      },
    }));
  };

  const clearRegistrationData = () => {
    setAuthState(prev => ({
      ...prev,
      registrationData: {},
    }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  };

  const setToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('auth_cookies', token);
      setAuthState(prev => ({
        ...prev,
        token,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  };

  const sendOTP = async (phoneNumber: string, role: 'SELLER' | 'USER' | 'RIDER' | 'ADMIN' = 'SELLER') => {
    try {
      setLoading(true);
      const response = await authAPI.sendOTP(phoneNumber, role);
      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, totp: string, verificationId: string) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(phoneNumber, totp, verificationId);
      
      if (response.token) {
        await setToken(response.token);
      }
      
      if (response.user) {
        // Extract all data from response
        const store = (response as any).store;
        const seller = (response as any).seller || (response as any).sellerInfo;
        const sellerPreferences = (response as any).sellerPreferences;
        const subdomain = store?.subdomain || seller?.subdomain || response.user?.subdomain || null;
        
        // Save all data to AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        
        if (seller) {
          await AsyncStorage.setItem('seller_data', JSON.stringify(seller));
        }
        if (store) {
          await AsyncStorage.setItem('store_data', JSON.stringify(store));
        }
        if (sellerPreferences) {
          await AsyncStorage.setItem('seller_preferences', JSON.stringify(sellerPreferences));
        }
        
        // Update auth state with all data
        setAuthState(prev => ({
          ...prev,
          user: response.user,
          seller: seller || null,
          store: store || null,
          sellerPreferences: sellerPreferences || null,
          isAuthenticated: true,
          subdomain: subdomain,
        }));
        
        console.log('Auth state updated with:', {
          hasUser: !!response.user,
          hasStore: !!store,
          hasSeller: !!seller,
          hasSellerPreferences: !!sellerPreferences,
          subdomain: subdomain
        });
      }
      
      return response;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerSeller = async (paymentData?: PaymentOptions) => {
    try {
      setLoading(true);
      const { registrationData } = authState;
      if (!registrationData.businessName || !registrationData.email || !registrationData.sellerLocation) {
        throw new Error('Missing required registration data');
      }

      // Use provided payment data or fall back to stored data
      const finalRegistrationData = {
        ...registrationData,
        paymentOptions: paymentData || registrationData.paymentOptions
      };

      if (!finalRegistrationData.paymentOptions) {
        throw new Error('Missing payment options');
      }

      const response = await authAPI.registerSeller(finalRegistrationData as RegistrationData);
      
      if (response.user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Extract subdomain, seller, store, and sellerPreferences info if available
        const store = (response as any).store;
        const seller = (response as any).seller || (response as any).sellerInfo;
        const sellerPreferences = (response as any).sellerPreferences;
        const subdomain = store?.subdomain || seller?.subdomain || response.user?.subdomain || null;
        
        // Save seller, store, and sellerPreferences data to AsyncStorage
        if (seller) {
          await AsyncStorage.setItem('seller_data', JSON.stringify(seller));
        }
        if (store) {
          await AsyncStorage.setItem('store_data', JSON.stringify(store));
        }
        if (sellerPreferences) {
          await AsyncStorage.setItem('seller_preferences', JSON.stringify(sellerPreferences));
        }
        
        setAuthState(prev => ({
          ...prev,
          user: response.user,
          seller: seller || null,
          store: store || null,
          sellerPreferences: sellerPreferences || null,
          isAuthenticated: true,
          registrationData: {},
          subdomain: subdomain,
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSellerPreferences = async () => {
    try {
      const response = await preferencesAPI.getSellerPreferences();
      const preferences = response.preferences;
      await AsyncStorage.setItem('seller_preferences', JSON.stringify(preferences));
      setAuthState(prev => ({ ...prev, sellerPreferences: preferences }));
    } catch (error) {
      // silently fail - keep using cached preferences
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('auth_cookies'),
        AsyncStorage.removeItem('user_data'),
        AsyncStorage.removeItem('seller_data'),
        AsyncStorage.removeItem('store_data'),
        AsyncStorage.removeItem('seller_preferences'),
      ]);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        seller: null,
        store: null,
        sellerPreferences: null,
        token: null,
        registrationData: {},
        subdomain: null,
      });
      console.log('Logout successful');
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    authState,
    updateRegistrationData,
    updateSellerLocation,
    updatePaymentOptions,
    clearRegistrationData,
    sendOTP,
    verifyOTP,
    registerSeller,
    logout,
    setLoading,
    setToken,
    initializeAuth,
    refreshSellerPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 