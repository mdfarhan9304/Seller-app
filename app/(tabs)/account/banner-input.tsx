import { useModal } from "@/contexts/ModalContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const BannerLinkInput = ({ defaultLink }: { defaultLink: string }) => {
  const [link, setLink] = useState(defaultLink);
  const { closeModal } = useModal();
  const handleSubmit = () => {
    closeModal(link);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Banner Link</Text>
      <Text style={styles.description}>Copy the product link and add it here to redirect to the product page when the banner is clicked.</Text>
      <TextInput
        placeholder="Enter the link"
        value={link}
        multiline
        numberOfLines={4}
        onChangeText={setLink}
        style={styles.input}
        placeholderTextColor="gray"
      />
      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "General-Sans-Medium",
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    marginBottom: 20,
    fontFamily: "General-Sans-Regular",
    color: "gray",

  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8D14CE",
    padding: 10,
    borderRadius: 4,
    gap: 8,
  },
  buttonText: {
    color: "white",
  },    
});

export default BannerLinkInput;
