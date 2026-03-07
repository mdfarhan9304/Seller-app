import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ToggleSwitch from "./ToggleSwitch";

interface ProductFormFieldsProps {
  productName: string;
  onProductNameChange: (value: string) => void;
  originalPrice: string;
  onOriginalPriceChange: (value: string) => void;
  sellingPrice: string;
  onSellingPriceChange: (value: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  details: string;
  onDetailsChange: (value: string) => void;
  categoryName: string;
  onCategoryPress: () => void;
  loadingCategories: boolean;
  scheduleDate: Date;
  scheduledText: string;
  showDatePicker: boolean;
  showTimePicker: boolean;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onTimeChange: (event: any, selectedTime?: Date) => void;
  onClearSchedule: () => void;
  availableIn60Minutes: boolean;
  onAvailableIn60MinutesChange: (value: boolean) => void;
  onCustomCategoryChange: (value: string) => void;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  productName,
  onProductNameChange,
  originalPrice,
  onOriginalPriceChange,
  sellingPrice,
  onSellingPriceChange,
  quantity,
  onQuantityChange,
  details,
  onDetailsChange,
  categoryName,
  onCategoryPress,
  loadingCategories,
  scheduleDate,
  scheduledText,
  showDatePicker,
  showTimePicker,
  onShowDatePicker,
  onShowTimePicker,
  onDateChange,
  onTimeChange,
  onClearSchedule,
  availableIn60Minutes,
  onAvailableIn60MinutesChange,
  onCustomCategoryChange,
}) => {
  const isScheduled = scheduleDate > new Date();
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (isScheduled && !scheduleEnabled) {
      setScheduleEnabled(true);
    }
  }, [isScheduled, scheduleEnabled]);

  const toggleSchedule = () => {
    const next = !scheduleEnabled;
    setScheduleEnabled(next);
    if (!next) {
      onClearSchedule();
      setShowScheduleModal(false);
    } else {
      setShowScheduleModal(true);
    }
  };

  const openScheduleModal = () => {
    if (!scheduleEnabled) {
      setScheduleEnabled(true);
    }
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
  };
  return (
    <KeyboardAvoidingView>
      {/* Product Name */}
      <TextInput
        style={styles.input}
        placeholder="Product name"
        value={productName}
        onChangeText={onProductNameChange}
        placeholderTextColor="#aaa"
      />

      {/* Original Price and Selling Price */}
      <View style={styles.cardRow}>
        <View style={styles.pricesRow}>
          <View style={styles.priceRow}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefixText}>₹</Text>
            </View>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Price (Original)"
              value={originalPrice}
              onChangeText={onOriginalPriceChange}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.spriceRow}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefixText}>₹</Text>
            </View>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Price (Selling)"
              value={sellingPrice}
              onChangeText={onSellingPriceChange}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <View style={styles.quantityRow}>
          <Text style={[styles.label, styles.quantityLabel]}>
            In Stock (Quantity)
          </Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.max(0, quantity - 1))}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(text) => {
                const numValue = parseInt(text, 10);
                if (!isNaN(numValue) && numValue >= 0) {
                  onQuantityChange(numValue);
                } else if (text === "") {
                  onQuantityChange(0);
                }
              }}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity
              onPress={() => onQuantityChange(quantity + 1)}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    

      {/* Details */}
      <View>
        <TextInput
          style={[styles.input, { height: 150, textAlignVertical: "top" }]}
          placeholder="Describe your product"
          value={details}
          onChangeText={onDetailsChange}
          multiline
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Category Selector */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onCategoryPress}
        activeOpacity={0.7}
      >
        <Text style={styles.menuButtonText}>
          {categoryName || "Select Category"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {loadingCategories && (
            <ActivityIndicator
              size="small"
              color="#470A68"
              style={{ marginRight: 8 }}
            />
          )}
          <Ionicons name="chevron-forward" size={24} color="#470A68" />
        </View>
      </TouchableOpacity>

      {categoryName === "Custom" && (
        <TextInput
          style={styles.input}
          placeholder="Custom Category"
          onChangeText={onCustomCategoryChange}
          placeholderTextColor="#aaa"
        />
      )}

      {/* Schedule for later */}
      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleLabelRow}>
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={toggleSchedule}
          >
            <View
              style={[
                styles.checkbox,
                scheduleEnabled && styles.checkboxChecked,
              ]}
            >
              {scheduleEnabled && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.scheduleLabel}>Schedule for later</Text>
          </TouchableOpacity>
          {scheduleEnabled && (
            <TouchableOpacity
              onPress={onClearSchedule}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {scheduleEnabled && (
          <>
            <View style={styles.scheduleSummaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>Scheduled for</Text>
                <Text style={styles.summaryValue}>
                  {scheduleDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {scheduleDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editScheduleButton}
                onPress={openScheduleModal}
              >
                <Text style={styles.editScheduleText}>Set date & time</Text>
              </TouchableOpacity>
            </View>

            {isScheduled && (
              <View style={styles.scheduledInfoCard}>
                <Ionicons name="information-circle" size={16} color="#8D14CE" />
                <Text style={styles.scheduledInfoText}>
                  Product will be available from {scheduledText}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={closeScheduleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set schedule</Text>
              <TouchableOpacity onPress={closeScheduleModal}>
                <Ionicons name="close" size={22} color="#470A68" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateTimeButton, styles.dateButton]}
                onPress={onShowDatePicker}
              >
                <Ionicons name="calendar-outline" size={20} color="#470A68" />
                <Text style={styles.dateTimeButtonText}>
                  {scheduleDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, styles.timeButton]}
                onPress={onShowTimePicker}
              >
                <Ionicons name="time-outline" size={20} color="#470A68" />
                <Text style={styles.dateTimeButtonText}>
                  {scheduleDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveScheduleButton}
              onPress={closeScheduleModal}
            >
              <Text style={styles.saveScheduleText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={scheduleDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={new Date()}
          style={Platform.OS === "ios" ? styles.datePickerIOS : undefined}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={scheduleDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {/* Available in 60 minutes */}
      <View style={styles.menuButton}>
        <Text style={styles.menuButtonText}>Available in 60 minutes</Text>
        <ToggleSwitch
          value={availableIn60Minutes}
          onValueChange={onAvailableIn60MinutesChange}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
    // height: 50,
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
    justifyContent: "center",
    flex: 1,
  },
  cardRow: {
    marginBottom: 16,
  },
  pricesRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
    minWidth: "48%",
    // justifyContent: "space-between",
  },
  spriceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 0,
    flex: 1,
    minWidth: "48%",
    // justifyContent: "space-between",
  },
  prefixContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    // height: "100%",
    backgroundColor: "rgba(120,120,128,0.12)",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  prefixText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    // textAlignVertical: "center",
    // textAlign: "center",
    // alignSelf: "center",
    // margin: "auto",
    color: "#000",
  },
  priceInput: {
    borderWidth: 0,
    borderRadius: 0,
    padding: 4,
    // backgroundColor: "red",
    paddingLeft: 8,
    marginBottom: 0,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
    
  },
  label: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
  },
  quantityLabel: {
    marginBottom: 0,
    lineHeight: 20,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(120,120,128,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 20,
    color: "#000",
  },
  quantityInput: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#000",
    marginHorizontal: 12,
    minWidth: 50,
    textAlign: "center",
  },
  menuButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    height: 56,
  },
  menuButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#470A68",
  },
  scheduleContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  scheduleLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    // marginBottom: 12,
  },
  scheduleLabel: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#470A68",
  },
  scheduleSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(71, 10, 104, 0.04)",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  summaryTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#470A68",
  },
  summaryValue: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "#000",
    marginTop: 2,
  },
  editScheduleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#470A68",
    borderRadius: 8,
  },
  editScheduleText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#fff",
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(71, 10, 104, 0.35)",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#470A68",
    borderColor: "#470A68",
  },
  clearButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#FF3B30",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(71, 10, 104, 0.1)",
    gap: 8,
  },
  dateButton: {
    flex: 1.2,
  },
  timeButton: {
    flex: 0.8,
  },
  dateTimeButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "#470A68",
  },
  scheduledInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(141, 20, 206, 0.05)",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  scheduledInfoText: {
    flex: 1,
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "#470A68",
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 16,
    color: "#000",
  },
  saveScheduleButton: {
    backgroundColor: "#470A68",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveScheduleText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 15,
    color: "#fff",
  },
  datePickerIOS: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "red",
  },
});
