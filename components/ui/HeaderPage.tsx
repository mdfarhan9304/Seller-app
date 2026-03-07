import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AnimatedPressable from "./AnimatedPressable";

type HeaderPageProps = {
  title?: string;
  onBackPress?: () => void;
  subtitle?: string;
  children?: React.ReactNode;
  subHeaderComponent?: React.ReactNode;
  enablePadding?: boolean;
  hideBackButton?: boolean;
  loading?: boolean;
};

export default function HeaderPage({
  hideBackButton = false,
  onBackPress,
  subtitle,
  title,
  subHeaderComponent,
  enablePadding = false,
  loading = false,
  children,
}: HeaderPageProps) {
  return (
    <LinearGradient
      colors={["#8D14CE", "#470A68", "#470A68"]}
      locations={[0, subHeaderComponent ? 0.5 : 0.2, 1]}
      style={styles.gradientContainer}
    >
      <StatusBar backgroundColor="#8D14CE" barStyle="light-content" />
      <View style={styles.safeArea}>
        {/* Logo and Text */}
        <View style={styles.headerRow}>
          <View style={styles.headerContainer}>
            {hideBackButton ? (
              <View style={styles.spacer} />
            ) : (
              <AnimatedPressable
                style={styles.backIconContainer}
                onPress={
                  onBackPress ||
                  (router.canGoBack()
                    ? router.back
                    : () => window.history.go(-1))
                }
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#FFF"
                  style={styles.backIcon}
                />
              </AnimatedPressable>
            )}
            <View style={{ width: "100%" }}>
              {title && (
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.headerTitle,
                    hideBackButton ? styles.headerTitleBig : {},
                    { fontSize: title.length > 10 ? 18 : 20 },
                  ]}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              )}
            </View>
          </View>
        </View>
        {subHeaderComponent && subHeaderComponent}
        <View
          style={[
            styles.childrenContainer,
            { padding: enablePadding ? 16 : 0 },
          ]}
        >
          {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : children}
        </View>
      </View>
    </LinearGradient>
  );
}

export const AppHeaderHOC = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & HeaderPageProps) => {
  if (Platform.OS === "web") {
    return children;
  }
  return <HeaderPage {...props}>{children}</HeaderPage>;
};

const styles = StyleSheet.create({
  gradientContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Platform.OS === "ios" ? 48 : 0,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
    maxWidth: "80%",
  },
  backIcon: {},
  backIconContainer: {
    padding: 8,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 8,
  },
  iconContainer: {
    // marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 100,
  },
  childrenContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "Filson-Bold",
    textAlign: "left",
    marginBottom: 4,
  },
  headerTitleBig: {
    fontFamily: "Filson-Bold",
  },
  spacer: {
    width: 4,
    height: 40,
  },
  headerSubtitle: {
    color: "#FFFFFFAA",
    // fontFamily: "Filson-Bold",
    textAlign: "left",
  },
  subtitleContainer: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  cartCount: {
    fontFamily: "Filson-Bold",
    textAlign: "center",
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#F3E545",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 100,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    color: "#000000",
    fontSize: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontFamily: "Filson-Bold",
    textAlign: "left",
  },
  menuItemImage: {
    width: 24,
    height: 24,
    marginRight: 16,
    borderRadius: 100,
    resizeMode: "cover",
  },
  poweredByContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  poweredByText: {
    fontFamily: "General-Sans-Regular",
    textAlign: "center",
    color: "#999",
    textTransform: "lowercase",
  },
  cartContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
