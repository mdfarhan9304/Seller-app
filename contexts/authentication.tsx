import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../app/types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentSession: {
    deviceType: 'mobile' | 'web';
    lastActivity: Date;
  } | null;
}

interface AuthContextType extends AuthState {
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  register: (data: { name: string; phone: string; password: string }) => Promise<void>;
  sendOTP: (phone: string) => Promise<{ requestId: string }>;
  verifyOTP: (requestId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    currentSession: null,
  });

  useEffect(() => {
    // Check authentication status on mount
  }, []);


  function loginwithPhone(){
    
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithEmail: async () => {},
        loginWithPhone: async () => {},
        register: async () => {},
        sendOTP: async () => ({ requestId: '' }),
        verifyOTP: async () => {},
        logout: async () => {},
      }}

      
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
