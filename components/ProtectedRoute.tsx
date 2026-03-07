import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useProtectedRoute } from '../contexts/ProtectedRouteContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isSellerApproved, isLoading } = useProtectedRoute();
  const router = useRouter();

  console.log("ProtectedRoute component - isLoading:", isLoading, "isSellerApproved:", isSellerApproved);

  // Direct approval mode: always allow access
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'GeneralSans-Medium',
  },
});
