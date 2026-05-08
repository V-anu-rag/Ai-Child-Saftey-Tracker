import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SOSAlertModalProps } from "../types";
import { navigate } from "../utils/navigationRef";
import { COLORS } from "../constants/theme";

export const SOSAlertModal: React.FC<SOSAlertModalProps> = ({
  isVisible,
  alertData,
  onClose,
}) => {
  if (!alertData) return null;

  const handleViewMap = () => {
    onClose();
    navigate("Map", { 
      childId: alertData.childId,
      latitude: alertData.location?.lat,
      longitude: alertData.location?.lng,
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.danger} />
        
        {/* Header / Siren Area */}
        <View style={styles.header}>
          <View style={styles.sirenIcon}>
            <Ionicons name="warning" size={80} color="#FFF" />
          </View>
          <Text style={styles.emergencyText}>EMERGENCY SOS</Text>
          <Text style={styles.immediateText}>Immediate help requested</Text>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <View style={styles.childInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{alertData.childName?.charAt(0) || "C"}</Text>
            </View>
            <View>
              <Text style={styles.childName}>{alertData.childName || "Your Child"}</Text>
              <Text style={styles.timeText}>Just now</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageContent}>{alertData.message}</Text>
          </View>

          {alertData.location && (
            <View style={styles.locationBox}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={20} color={COLORS.danger} />
                <Text style={styles.locationTitle}>LAST KNOWN LOCATION</Text>
              </View>
              <Text style={styles.locationValue}>
                {alertData.location.lat.toFixed(4)}, {alertData.location.lng.toFixed(4)}
              </Text>
              {alertData.location.address && (
                <Text style={styles.addressText}>{alertData.location.address}</Text>
              )}
            </View>
          )}
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.dismissButton]} 
            onPress={onClose}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.mapButton]} 
            onPress={handleViewMap}
          >
            <Text style={styles.mapText}>View Live Map</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.danger,
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  sirenIcon: {
    marginBottom: 20,
  },
  emergencyText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  immediateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: -20,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(0, 212, 170, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.salmon,
  },
  childName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.jet,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  messageBox: {
    backgroundColor: "rgba(255, 77, 77, 0.04)",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.15)",
    marginBottom: 24,
  },
  messageContent: {
    fontSize: 18,
    color: COLORS.danger,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 26,
  },
  locationBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.green,
    shadowColor: COLORS.jet,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.jet,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.green,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButton: {
    borderWidth: 2,
    borderColor: COLORS.jet,
  },
  mapButton: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.jet,
  },
  mapText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
