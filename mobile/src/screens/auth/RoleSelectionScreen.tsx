import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Shield, User, Smartphone, ArrowRight } from "lucide-react-native";
import { motion } from "framer-motion"; // Note: In React Native we usually use Reanimated, but I'll stick to standard RN for compatibility unless requested

const { width } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }: any) {
  const { setUnauthRole } = useAuth(); // We'll add this to AuthContext

  const selectRole = (role: "parent" | "child") => {
    // This state change triggers AppNavigator to re-render 
    // and automatically show the correct stack.
    setUnauthRole(role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Shield size={40} stroke="#D64550" />
        </View>
        <Text style={styles.title}>SafeTrack</Text>
        <Text style={styles.subtitle}>Who is using this app?</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Parent Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => selectRole("parent")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#D6455020" }]}>
            <User size={32} stroke="#D64550" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I'm a Parent</Text>
            <Text style={styles.cardDescription}>Monitor children, set safe zones, and receive alerts.</Text>
          </View>
          <ArrowRight size={20} stroke="#D64550" />
        </TouchableOpacity>

        {/* Child Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => selectRole("child")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#4285F420" }]}>
            <Smartphone size={32} stroke="#4285F4" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I'm a Child</Text>
            <Text style={styles.cardDescription}>Pair this device with your parent's account to stay safe.</Text>
          </View>
          <ArrowRight size={20} stroke="#4285F4" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>You can change this later in settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2826",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#D6455010",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF80",
    marginTop: 8,
    fontWeight: "500",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#2A3B38",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF10",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#FFFFFF60",
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    color: "#FFFFFF40",
    fontSize: 12,
    marginTop: 48,
  },
});
