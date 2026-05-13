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
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "../../context/AuthContext";
import { childrenAPI } from "../../api/client";
import { COLORS } from "../../constants/theme";

export default function PairChildScreen() {
  const { setUnauthRole, completePairing } = useAuth();
  const [pairingCode, setPairingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();

  const handlePair = async (code: string) => {
    const finalCode = code || pairingCode;
    if (finalCode.length < 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-character pairing code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await childrenAPI.pair(finalCode, "Child Device") as any;
      if (res.success) {
        await completePairing(res.user, res.token);
        Alert.alert("Success!", "This device has been linked to your parent.");
        setIsScannerOpen(false);
      }
    } catch (err: any) {
      Alert.alert("Pairing Failed", err.message || "Invalid pairing code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = ({ data }: { data: string }) => {
    if (isScannerOpen) {
      setIsScannerOpen(false);
      setPairingCode(data);
      handlePair(data);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Denied", "Camera access is required to scan QR codes.");
        return;
      }
    }
    setIsScannerOpen(true);
  };

  if (isScannerOpen) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={handleQRScan}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <View style={styles.focusedInner}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <TouchableOpacity 
          style={styles.closeScanner}
          onPress={() => setIsScannerOpen(false)}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.scannerHint}>Align the QR code within the frame</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back to Role Selection */}
          <TouchableOpacity 
            style={styles.backLink}
            onPress={() => setUnauthRole(null)}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
            <Text style={styles.backLinkText}>Switch Role</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.brand}>
              Safe<Text style={{ color: COLORS.primary }}>Track</Text>
            </Text>
            <Text style={styles.subtitle}>Child Safety Monitoring</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Link Child Device</Text>
            <Text style={styles.caption}>Enter pairing code to synchronize tracking</Text>

            {/* Pairing Code Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Pairing Code</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  maxLength={6}
                  value={pairingCode}
                  onChangeText={setPairingCode}
                />
              </View>
            </View>

            {/* Connect Button */}
            <TouchableOpacity
              style={[styles.btn, (pairingCode.length < 6 || isLoading) && styles.btnDisabled]}
              onPress={() => handlePair(pairingCode)}
              disabled={isLoading || pairingCode.length < 6}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Connect Device →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* QR Scan Button (Secondary outline style) */}
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={openScanner}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.qrButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backLinkText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  logoSection: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  caption: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    color: COLORS.textMuted,
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 14,
    height: 52,
    marginTop: 4,
    backgroundColor: "transparent",
  },
  qrButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  focusedContainer: {
    flexDirection: "row",
    height: 280,
  },
  focusedInner: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.salmon,
    borderRadius: 32,
    backgroundColor: "transparent",
  },
  closeScanner: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerHint: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
