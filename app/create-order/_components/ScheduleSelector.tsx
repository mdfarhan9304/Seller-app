import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { useModal } from "@/contexts/ModalContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export const formatDate = (date: Date) => {
  const options = { day: "2-digit", month: "short" } as const;
  const formattedDate = date.toLocaleDateString("en-US", options);
  const formattedTime = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
  return `${formattedDate}, ${formattedTime}`;
};
interface ScheduleSelectorProps {
  onDateTimeChange?: (dateTime: Date | null) => void;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  onDateTimeChange,
}) => {
  const { openModal, closeModal } = useModal();
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const onEnableSchedule = () => {
    const presentYear = new Date().getFullYear();
    const presentMonth = new Date().getMonth();
    const presentDay = new Date().getDate();
    const presentHour = new Date().getHours();
    const minimumDate = new Date(presentYear, presentMonth, presentDay, presentHour+2, 0, 0);
    openModal(
      <View style={styles.modalOverlay}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Date</Text>
          <TouchableOpacity
            onPress={() => {
              closeModal();
            }}
          >
            <Text style={styles.modalButton}>Done</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={dateTime || new Date()}
          style={styles.dateTimePicker}
          mode="datetime"
          display="spinner"
          onChange={(event, selectedDate) => {
            setDateTime(selectedDate || new Date());
            onDateTimeChange?.(selectedDate || null);
          }}
          minimumDate={minimumDate}
          maximumDate={new Date(2030, 11, 31)}
          locale="en-US"
          textColor="#333"
          accentColor="#8D14CE"
        />
      </View>
    );
  };
  return (
    <View>
      <View style={styles.scheduleButton}>
        <AnimatedPressable onPress={onEnableSchedule}>
          <Text style={styles.scheduleButtonText}>Schedule</Text>
          {dateTime && (
            <Text style={styles.scheduledTimeText}>
              {formatDate(dateTime)}
            </Text>
          )}
        </AnimatedPressable>
        <Switch
          trackColor={{ false: "#E5E5E5", true: "#10B17D" }}
          onValueChange={(value) => {
            if (value) {
              setDateTime(new Date());
              onEnableSchedule();
            } else {
              setDateTime(null);
              onDateTimeChange?.(null);
            }
          }}
          value={dateTime ? true : false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  scheduleCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 12,
    color: "#8D14CE",
    fontFamily: "General-Sans-Medium",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#8D14CE",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#8D14CE",
  },
  scheduleText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "General-Sans-Medium",
  },
  dateTimeSection: {
    // marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
    fontFamily: "General-Sans-Medium",
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.1)",
  },
  scheduleButtonText: {
    fontSize: 16,
    fontFamily: "General-Sans-Medium",
    color: "#333",
  },
  modalOverlay: {},
  modalContainer: {
    backgroundColor: "white",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "General-Sans-Medium",
  },
  modalButton: {
    fontSize: 16,
    color: "#8D14CE",
    fontFamily: "General-Sans-Medium",
  },
  dateTimePicker: {
    height: 200,
    alignSelf: "center",
  },
  scheduledTimeText: {
    fontSize: 14,
    color: "#aaa",
    fontFamily: "General-Sans-Medium",
  },
});

export default ScheduleSelector;
