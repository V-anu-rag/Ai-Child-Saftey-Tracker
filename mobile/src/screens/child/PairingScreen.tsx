import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Shield, Smartphone, QrCode, ArrowRight, ChevronLeft, X } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "../../context/AuthContext";
import { childrenAPI } from "../../api/client";

export default function ChildPairingScreen() {
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
        // Automatically log the child in using the returned token
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
          <X size={28} stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.scannerHint}>Align the QR code within the frame</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setUnauthRole(null)}
        >
          <ChevronLeft size={24} stroke="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Smartphone size={40} stroke="#4285F4" />
          </View>
          <Text style={styles.title}>Link Device</Text>
          <Text style={styles.subtitle}>
            Enter the pairing code shown on your parent's dashboard.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pairing Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 7H2X9L"
            placeholderTextColor="#FFFFFF40"
            autoCapitalize="characters"
            maxLength={6}
            value={pairingCode}
            onChangeText={setPairingCode}
          />
          <Text style={styles.hint}>
            The code is case-insensitive.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, pairingCode.length < 6 && styles.buttonDisabled]}
          onPress={() => handlePair(pairingCode)}
          disabled={isLoading || pairingCode.length < 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Pair Device</Text>
              <ArrowRight size={20} stroke="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity 
          style={styles.qrButton}
          onPress={openScanner}
        >
          <QrCode size={20} stroke="#FFFFFF80" />
          <Text style={styles.qrButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2826",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 4,
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#4285F410",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF60",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#FFFFFF80",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#2A3B38",
    borderRadius: 16,
    padding: 18,
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF10",
  },
  hint: {
    color: "#FFFFFF30",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4285F4",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#4285F450",
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF10",
  },
  orText: {
    color: "#FFFFFF20",
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF10",
  },
  qrButtonText: {
    color: "#FFFFFF80",
    fontSize: 16,
    fontWeight: "600",
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
    borderColor: "#4285F4",
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
