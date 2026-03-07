import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { Colors } from "@/constants/Colors";
import { useModal } from "@/contexts/ModalContext";
import { orderAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const AddressForm = ({ initialData }: { initialData: any }) => {
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    formattedAddress: initialData?.formattedAddress || "",
    pincode: initialData?.pincode || "",
  });
  const refs = useRef<{
    name: React.RefObject<TextInput>;
    phone: React.RefObject<TextInput>;
    formattedAddress: React.RefObject<TextInput>;
    pincode: React.RefObject<TextInput>;
  }>({
    name: useRef<TextInput>(null!),
    phone: useRef<TextInput>(null!),
    formattedAddress: useRef<TextInput>(null!),
    pincode: useRef<TextInput>(null!),
  });
  const handleSave = async () => {
    const response = await orderAPI.validatePincode(formData.pincode);
    const state = response?.pincodeData?.statename || "NA";
    const city =
      `${response?.pincodeData?.divisionname}, ${response?.pincodeData?.district}` ||
      "NA";
    closeModal({ ...formData, state, city } as any);
  };
  const isDisabled =
    Object.values(formData).some((value) => value === "") ||
    formData.pincode?.length !== 6 ||
    formData.phone?.length !== 10;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Address</Text>
      <Text style={styles.subtitle}>Enter customer's address details</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={formData.name}
          returnKeyType="next"
          onSubmitEditing={() => refs.current.phone.current?.focus()}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          ref={refs.current.name}
        />
        <TextInput
          placeholder="Phone"
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="next"
          style={styles.input}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={formData.phone}
          onSubmitEditing={() => refs.current.formattedAddress.current?.focus()}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          ref={refs.current.phone}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Address"
          returnKeyType="next"
          style={styles.input}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={formData.formattedAddress}
          onSubmitEditing={() => refs.current.pincode.current?.focus()}
          onChangeText={(text) =>
            setFormData({ ...formData, formattedAddress: text })
          }
          ref={refs.current.formattedAddress}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Pincode"
          returnKeyType="done"
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={formData.pincode}
          onChangeText={(text) => setFormData({ ...formData, pincode: text })}
          ref={refs.current.pincode}
        />
      </View>
      <AnimatedPressable
        disabled={isDisabled}
        onPress={handleSave}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Save Address</Text>
        <Ionicons name="chevron-forward" size={20} color="#333" />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 20,
    fontFamily: "Filson-Bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Filson-Regular",
    color: "#888",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#333",
    flex: 1,
    fontFamily: "General-Sans-Regular",
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.secondary,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Filson-Bold",
    color: "#333",
  },
  buttonIcon: {
    fontSize: 20,
    fontFamily: "Filson-Bold",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});
