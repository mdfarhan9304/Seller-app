import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteContextType {
  isSellerApproved: boolean;
  isLoading: boolean;
  checkSellerStatus: () => Promise<void>;
}

const ProtectedRouteContext = createContext<ProtectedRouteContextType | undefined>(undefined);

export const useProtectedRoute = () => {
  const context = useContext(ProtectedRouteContext);
  if (!context) {
    throw new Error('useProtectedRoute must be used within a ProtectedRouteProvider');
  }
  return context;
};

interface ProtectedRouteProviderProps {
  children: React.ReactNode;
}

export const ProtectedRouteProvider: React.FC<ProtectedRouteProviderProps> = ({ children }) => {
  // Direct approval mode
  const [isSellerApproved, setIsSellerApproved] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const hasCheckedRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { authState } = useAuth();

  const checkSellerStatus = async () => {
    // Direct approval: keep approved and not loading. Still ensure logged-in.
    if (isChecking || hasCheckedRef.current) return;
    try {
      setIsChecking(true);
      hasCheckedRef.current = true;

      const token = await AsyncStorage.getItem('auth_cookies');
      if(!token) {
        router.replace('/');
        return;
      }
      setIsSellerApproved(true);
    } catch (e) {
      router.replace('/');
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Only check once when auth is ready and user is available
    if (authState.isAuthenticated && authState.user && !isChecking && !hasCheckedRef.current && !authState.isLoading) {
      checkSellerStatus();
    } else if (!authState.isAuthenticated && !authState.isLoading) {
      setIsLoading(false);
      setIsSellerApproved(true);
      hasCheckedRef.current = false; // Reset when logged out
    } else if (!authState.isLoading) {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user, authState.isLoading]);

  return (
    <ProtectedRouteContext.Provider value={{
      isSellerApproved,
      isLoading,
      checkSellerStatus,
    }}>
      {children}
    </ProtectedRouteContext.Provider>
  );
};
