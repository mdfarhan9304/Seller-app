import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../../components/Header';
import { preferencesAPI } from '../../../services/api';

const { width } = Dimensions.get('window');

const DeliverySettingsScreen = () => {
  const router = useRouter();
  const [deliveryMode, setDeliveryMode] = useState<'automatic' | 'manual'>('manual');
  const [pickupTime, setPickupTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [shippingCostSplit, setShippingCostSplit] = useState(40);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const sliderRef = useRef<View>(null);
  const sliderLayoutRef = useRef({ x: 0, width: 0 });

  useEffect(() => {
    fetchDeliverySettings();
  }, []);

  const fetchDeliverySettings = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getSellerPreferences();
      if (response.preferences?.deliverySettings) {
        const settings = response.preferences.deliverySettings;
        setDeliveryMode(settings.deliveryMode);
        setPickupTime(new Date(settings.pickupTime));
        setShippingCostSplit(settings.shippingCostSplit);
      }
    } catch (error: any) {
      console.error('Error fetching delivery settings:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load delivery settings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await preferencesAPI.updateDeliverySettings({
        deliveryMode,
        pickupTime: pickupTime.toISOString(),
        shippingCostSplit,
      });
    Alert.alert('Success', 'Delivery settings saved successfully');
    } catch (error: any) {
      console.error('Error saving delivery settings:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save delivery settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSliderMove = (value: number) => {
    const newValue = Math.max(0, Math.min(100, Math.round(value)));
    setShippingCostSplit(newValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        if (sliderLayoutRef.current.width > 0) {
          const trackWidth = sliderLayoutRef.current.width - 20;
          const newPosition = Math.max(0, Math.min(trackWidth, gestureState.moveX - sliderLayoutRef.current.x - 10));
          const percentage = (newPosition / trackWidth) * 100;
          handleSliderMove(percentage);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleSliderPress = (evt: any) => {
    if (sliderLayoutRef.current.width > 0) {
      sliderRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const trackWidth = width - 20;
        const touchX = evt.nativeEvent.pageX - pageX - 10;
        const percentage = (Math.max(0, Math.min(trackWidth, touchX)) / trackWidth) * 100;
        handleSliderMove(percentage);
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setPickupTime(selectedTime);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#8D14CE', '#470A68']} style={styles.gradient}>
          <View style={styles.headerContainer}>
            <Header title="Delivery Settings" showBackButton={true} />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F3E545" />
              <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8D14CE', '#470A68']} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Header title="Delivery Settings" showBackButton={true} />
          
          <View style={styles.mainContent}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Mode Selection */}
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.optionContainer}
              onPress={() => setDeliveryMode('manual')}
            >
              <Text style={styles.optionText}>Manually mark orders for delivery</Text>
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, deliveryMode === 'manual' && styles.radioSelected]}>
                  {deliveryMode === 'manual' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.optionContainer}
              onPress={() => setDeliveryMode('automatic')}
            >
              <Text style={styles.optionText}>Automatically mark orders for delivery</Text>
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, deliveryMode === 'automatic' && styles.radioSelected]}>
                  {deliveryMode === 'automatic' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pickup Time Selection */}
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.optionContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.optionText}>Schedule pickups at</Text>
              <View style={styles.timePickerContainer}>
                <Text style={styles.timeText}>{formatTime(pickupTime)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Shipping Cost Split */}
          <View style={styles.shippingCostCard}>
            <Text style={styles.sectionTitle}>Shipping Cost Split</Text>
            <Text style={styles.sectionDescription}>
              Use the slider to divide the shipping cost between you and your customers.
            </Text>

            {/* Cost Distribution Display */}
            <View style={styles.costDistribution}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>You</Text>
                <Text style={styles.costPercent}>{shippingCostSplit}%</Text>
              </View>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, styles.rightAlign]}>Customer</Text>
                <Text style={[styles.costPercent, styles.rightAlign]}>{100 - shippingCostSplit}%</Text>
              </View>
            </View>

            {/* Slider Container */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={[styles.sliderLabel, styles.rightAlign]}>100%</Text>
              </View>
              
              <TouchableOpacity
                activeOpacity={1}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  sliderLayoutRef.current = { x, width };
                }}
                onPress={handleSliderPress}
              >
                <View
                  ref={sliderRef}
                  style={styles.sliderTrack}
                  {...panResponder.panHandlers}
                >
                <View style={[styles.sliderProgress, { width: `${shippingCostSplit}%` }]} />
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${shippingCostSplit}%` }
                    ]}
                  />
              </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.settingNote}>
              This setting applies to all your orders.{'\n'}You can update it any time.
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
            <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={pickupTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 19,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  shippingCostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
  },
  radioContainer: {
    marginLeft: 16,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#0094B2',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0094B2',
  },
  timePickerContainer: {
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'General-Sans-Medium',
    color: '#007AFF',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 12,
    fontFamily: 'General-Sans-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 24,
    lineHeight: 16,
  },
  costDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  costItem: {
    flex: 1,
  },
  costLabel: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000',
    marginBottom: 4,
  },
  costPercent: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000',
  },
  rightAlign: {
    textAlign: 'right',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: 'General-Sans-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderProgress: {
    height: 6,
    backgroundColor: '#8D14CE',
    borderRadius: 3,
  },
  sliderThumb: {
    width: 17,
    height: 17,
    backgroundColor: '#8D14CE',
    borderRadius: 8.5,
    position: 'absolute',
    top: -5.5,
    marginLeft: -8.5,
  },
  settingNote: {
    fontSize: 12,
    fontFamily: 'General-Sans-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 16,
  },
  saveButtonContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#F3E545',
    borderRadius: 8,
    padding: 16,
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
  saveButtonDisabled: {
    backgroundColor: '#F3E54580',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#000',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'General-Sans-Medium',
    color: '#666',
  },
});

export default DeliverySettingsScreen; 