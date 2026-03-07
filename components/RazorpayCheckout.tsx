import React, { useEffect } from 'react';
import { Modal, ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_CONFIG } from '@/config/payment';

interface RazorpayCheckoutProps {
  isVisible: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: any) => void;
}

const RazorpayCheckoutModal: React.FC<RazorpayCheckoutProps> = ({
  isVisible,
  onClose,
  orderId,
  amount,
  description,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isVisible && orderId) {
      try {
        console.log('Opening Razorpay with order ID:', orderId);
        
        // Validate amount is a positive number
        if (isNaN(amount) || amount <= 0) {
          throw new Error(`Invalid amount: ${amount}. Amount must be a positive number.`);
        }
        
        // Convert to paise (already rounded in Payment.tsx)
        const amountInPaise = amount * 100;
        console.log('Amount in paise:', amountInPaise);
        
        const options = {
          key: RAZORPAY_CONFIG.KEY_ID,
          amount: String(amountInPaise), // Convert to string as required by Razorpay
          currency: 'INR',
          name: 'Unicapp',
          description: description || 'Package Delivery Payment',
          order_id: orderId,
          prefill: {
            name: customerName || '',
            email: customerEmail || '',
            contact: customerPhone || ''
          },
          theme: { color: '#470A68' },
          notes: {
            address: 'Unicapp Customer'
          }
        };
        
        console.log('Razorpay options:', JSON.stringify(options));
        
        // Add a small delay before opening Razorpay
        timeoutId = setTimeout(() => {
          RazorpayCheckout.open(options)
            .then((data: any) => {
              // Payment successful
              console.log('Payment successful:', data);
              const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
              onSuccess(razorpay_payment_id, razorpay_order_id, razorpay_signature);
              onClose();
            })
            .catch((error: any) => {
              // Handle payment failure
              console.error('Payment failed:', error);
              
              // Better error handling to provide more specific feedback
              const errorMessage = error.description || error.message || 'Payment failed. Please try again.';
              Alert.alert('Payment Failed', errorMessage);
              
              onFailure(error);
              onClose();
            });
        }, 1000);
      } catch (error: any) {
        console.error('Error opening Razorpay:', error);
        Alert.alert('Error', error.message || 'Failed to open payment gateway. Please try again.');
        onFailure(error);
        onClose();
      }
    }
    
    // Cleanup timeout if component unmounts
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, orderId]);
  
  if (!isVisible) return null;
  
  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#470A68" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});

export default RazorpayCheckoutModal;