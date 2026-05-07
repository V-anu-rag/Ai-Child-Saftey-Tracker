import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Shield, User, Smartphone, ArrowRight } from "lucide-react-native";
import { COLORS } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }: any) {
  const { setUnauthRole } = useAuth();

  const selectRole = (role: "parent" | "child") => {
    setUnauthRole(role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Shield size={40} stroke={COLORS.primary} />
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
          <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
            <User size={32} stroke={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I'm a Parent</Text>
            <Text style={styles.cardDescription}>Monitor children, set safe zones, and receive alerts.</Text>
          </View>
          <ArrowRight size={20} stroke={COLORS.primary} />
        </TouchableOpacity>

        {/* Child Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => selectRole("child")}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
            <Smartphone size={32} stroke={COLORS.accent} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I'm a Child</Text>
            <Text style={styles.cardDescription}>Pair this device with your parent's account to stay safe.</Text>
          </View>
          <ArrowRight size={20} stroke={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>You can change this later in settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
    backgroundColor: `${COLORS.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: "500",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 48,
  },
});
