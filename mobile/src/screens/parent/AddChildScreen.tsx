import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { childrenAPI } from "../../api/client";

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550",
  salmon: "#EA9E8D", jet: "#1C2826",
};

export default function AddChildScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleAddChild = async () => {
    if (!name || !age) return;

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge >= 18) {
      Alert.alert("Invalid Age", "Age must be less than 18 to be added.");
      return;
    }

    setLoading(true);
    try {
      const res = await childrenAPI.add({ name, age: parsedAge }) as any;
      if (res.success) {
        setPairingCode(res.child.pairingCode);
        setStep(2);
      }
    } catch (err: any) {
      console.error("Add child error:", err);
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to add child.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.jet} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{step === 1 ? "Add Child" : "Pairing Code"}</Text>
            <View style={{ width: 40 }} />
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={40} color={COLORS.red} />
              </View>
              <Text style={styles.title}>Create Child Profile</Text>
              <Text style={styles.subtitle}>Enter your child's details to generate a unique pairing code for their device.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CHILD'S NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Leo Johnson"
                  placeholderTextColor={`${COLORS.jet}40`}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AGE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10"
                  placeholderTextColor={`${COLORS.jet}40`}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={[styles.mainBtn, (!name || !age) && styles.disabledBtn]}
                onPress={handleAddChild}
                disabled={loading || !name || !age}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.mainBtnText}>Generate Pairing Code</Text>
                    <Ionicons name="qr-code-outline" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successView}>
              <View style={styles.iconCircleSuccess}>
                <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
              </View>
              <Text style={styles.title}>Profile Created!</Text>
              <Text style={styles.subtitle}>Download SafeTrack on your child's phone and enter this code during setup:</Text>

              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>PAIRING CODE</Text>
                <Text style={styles.codeText}>{pairingCode}</Text>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.jet} />
                <Text style={styles.infoText}>This code will expire once the device is paired.</Text>
              </View>

              <TouchableOpacity 
                style={styles.doneBtn}
                onPress={() => navigation.navigate("DashboardMain")}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  form: { alignItems: "center" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 20, shadowColor: COLORS.red, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  iconCircleSuccess: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.jet, marginBottom: 8 },
  subtitle: { fontSize: 14, color: `${COLORS.jet}60`, textAlign: "center", paddingHorizontal: 20, marginBottom: 30, lineHeight: 20 },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "800", color: `${COLORS.jet}50`, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.jet, borderWeight: 1, borderColor: "transparent" },
  mainBtn: { width: "100%", backgroundColor: COLORS.red, borderRadius: 18, height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10, shadowColor: COLORS.red, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  disabledBtn: { opacity: 0.5 },
  mainBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  successView: { alignItems: "center" },
  codeContainer: { backgroundColor: "#fff", borderRadius: 24, padding: 30, width: "100%", alignItems: "center", marginBottom: 20, borderStyle: "dashed", borderWidth: 2, borderColor: COLORS.red },
  codeLabel: { fontSize: 12, fontWeight: "800", color: COLORS.red, marginBottom: 10, letterSpacing: 2 },
  codeText: { fontSize: 42, fontWeight: "900", color: COLORS.jet, letterSpacing: 8 },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: `${COLORS.jet}05`, padding: 12, borderRadius: 12, marginBottom: 30 },
  infoText: { fontSize: 12, color: `${COLORS.jet}60` },
  doneBtn: { width: "100%", backgroundColor: COLORS.jet, borderRadius: 18, height: 56, alignItems: "center", justifyContent: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
