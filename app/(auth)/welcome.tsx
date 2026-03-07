import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // @ts-ignore - route exists at runtime
    router.push({
      pathname: "/",
    }); // route to phone input screen
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#470A68", "#8D14CE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.contentWrap}>
            {/* For Business tag */}
            <View style={styles.forBusinessRow}>
              <Image
                source={require("../../assets/images/unicapp-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.forBusinessText}>For Business</Text>
            </View>

            {/* Divider line */}
            <View style={styles.divider} />

            {/* Seller Mode pill */}
            <View style={styles.sellerPillOuter}>
              <View style={styles.sellerPillInner}>
                <Text style={styles.sellerPillText}>
                  ⚡️ SELLER MODE UNLOCKED!
                </Text>
              </View>
            </View>

            {/* Big headline */}
            <Text style={styles.headline}>
              Setup in 60 secs, Deliver in 60 mins.
            </Text>

            {/* Subtext */}
            <Text style={styles.subcopy}>
              Bas products add karo, link share karo. Delivery ka tension? We've
              got it.
            </Text>
          </View>

          {/* CTA fixed at bottom */}
          <View style={styles.ctaBarWrap}>
            <TouchableOpacity
              style={styles.ctaBar}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaBarText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1 },
  safe: { flex: 1, justifyContent: "space-between" },
  topRow: { paddingHorizontal: 24, paddingTop: 8 },
  logo: { width: 120, height: 36 },
  contentWrap: {
    paddingHorizontal: 34,
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  forBusinessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.94)",
    marginRight: 12,
  },
  forBusinessText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 17,
    fontFamily: "General-Sans-Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    width: "95%",
    marginVertical: 20,
  },
  sellerPillOuter: {
    backgroundColor: "rgba(94,94,94,0.5)",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  sellerPillInner: {
    backgroundColor: "rgba(255,239,64,0.24)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sellerPillText: {
    color: "#F3E545",
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
  },
  headline: {
    color: "#FFF",
    fontSize: 26,
    fontFamily: "General-Sans-Semibold",
    marginTop: 16,
    lineHeight: 35,
    maxWidth: 280,
  },
  subcopy: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
    marginTop: 16,
    maxWidth: 275,
  },
  ctaBarWrap: { paddingHorizontal: 24, paddingBottom: 24 },
  ctaBar: {
    backgroundColor: "#F3E545",
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBarText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "General-Sans-Medium",
  },
});
