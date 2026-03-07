import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { RAZORPAY_CONFIG } from '@/config/payment';

interface RazorpayWebViewCheckoutProps {
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

const RazorpayWebViewCheckout: React.FC<RazorpayWebViewCheckoutProps> = ({
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
  const generateHTML = () => {
    const options = {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: 2500,
      currency: 'INR',
      name: 'Unicapp',
      description: description || 'Package Delivery Payment',
      order_id: orderId,
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      theme: { color: '#470A68' },
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <script>
            const options = ${JSON.stringify(options)};
            const rzp = new Razorpay(options);

            rzp.on('payment.success', function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'success',
                data: response
              }));
            });

            rzp.on('payment.error', function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                data: response
              }));
            });

            rzp.open();
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      if (response.type === 'success') {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response.data;
        onSuccess(razorpay_payment_id, razorpay_order_id, razorpay_signature);
      } else if (response.type === 'error') {
        onFailure(response.data);
      }
      onClose();
    } catch (error) {
      onFailure(error);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <WebView
          source={{ html: generateHTML() }}
          onMessage={handleMessage}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#470A68" />
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

export default RazorpayWebViewCheckout;
