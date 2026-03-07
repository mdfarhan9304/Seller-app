import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import RazorpayCheckout from './RazorpayCheckout';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RazorpayPaymentProps {
  amount: number;
  orderId: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  orderId,
  description = 'Order Payment',
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const authToken = await AsyncStorage.getItem('auth_cookies');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      // Show the payment modal
      setIsModalVisible(true);
    } catch (error) {
      onError(error);
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, rzpOrderId: string, signature: string) => {
    try {
      const authToken = await AsyncStorage.getItem('auth_cookies');
      
      // Here you would typically make an API call to your backend to verify the payment
      // This is just a placeholder - implement your verification logic
      const verificationResponse = {
        paymentId,
        orderId: rzpOrderId,
        signature,
        status: 'success'
      };
      
      onSuccess(verificationResponse);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    onError(error);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsLoading(false);
    onCancel?.();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>Pay Now</Text>
          {isLoading && <ActivityIndicator color="#FFF" style={styles.loader} />}
        </View>
      </TouchableOpacity>
      
      <RazorpayCheckout 
        isVisible={isModalVisible}
        onClose={handleClose}
        orderId={orderId}
        amount={amount}
        description={description || 'Order Payment'}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#470A68',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
  },
  loader: {
    marginLeft: 8,
  },
});

export default RazorpayPayment;