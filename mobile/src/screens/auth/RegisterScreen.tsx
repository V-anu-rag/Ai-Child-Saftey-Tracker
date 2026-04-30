import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#1C2826",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
  red: "#D64550",
  green: "#DAEFB3",
  salmon: "#EA9E8D",
};

export default function RegisterScreen({ navigation }: any) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "parent" });
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { name, email, password, role } = form;
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    try {
      setLoading(true);
      await signup(name.trim(), email.trim().toLowerCase(), password, role);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join SafeTrack to protect your family</Text>
          </View>

          <View style={styles.card}>
            {/* Role selector */}
            <View style={styles.roleRow}>
              {["parent", "child"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, form.role === r && styles.roleActive]}
                  onPress={() => update("role", r)}
                >
                  <Ionicons
                    name={r === "parent" ? "people" : "person"}
                    size={16}
                    color={form.role === r ? "#fff" : COLORS.textMuted}
                  />
                  <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {[
              { key: "name", label: "Full Name", placeholder: "Sarah Johnson", icon: "person-outline", keyboard: "default" },
              { key: "email", label: "Email", placeholder: "you@example.com", icon: "mail-outline", keyboard: "email-address" },
              { key: "password", label: "Password", placeholder: "Min 8 characters", icon: "lock-closed-outline", keyboard: "default", secure: true },
            ].map(({ key, label, placeholder, icon, keyboard, secure }) => (
              <View key={key} style={styles.fieldGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={icon as any} size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    value={(form as any)[key]}
                    onChangeText={(v) => update(key, v)}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType={keyboard as any}
                    autoCapitalize={key === "email" ? "none" : "words"}
                    secureTextEntry={secure}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Create Account →</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: 24 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  backText: { color: COLORS.textMuted, fontSize: 14 },
  logoSection: { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.red, alignItems: "center", justifyContent: "center", marginBottom: 12,
    shadowColor: COLORS.red, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1,
    borderColor: COLORS.border, padding: 24,
  },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  roleActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  roleText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, height: 50,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
  btn: {
    backgroundColor: COLORS.red, borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center", marginTop: 8,
    shadowColor: COLORS.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
