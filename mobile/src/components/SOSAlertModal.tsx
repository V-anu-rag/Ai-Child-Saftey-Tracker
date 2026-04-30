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

import { SOSAlertModalProps } from "../types"; // I'll fix types later if needed, but for now I'll just keep it inline or import from where it is
import { navigationRef } from "../utils/navigationRef";

const COLORS = {
  red: "#D64550",
  jet: "#1C2826",
  bg: "#FFFFFF",
};

export const SOSAlertModal: React.FC<SOSAlertModalProps> = ({
  isVisible,
  alertData,
  onClose,
}) => {
  if (!alertData) return null;

  const handleViewMap = () => {
    onClose();
    if (navigationRef.isReady()) {
      navigationRef.navigate("Map" as never, { 
        childId: alertData.childId,
        latitude: alertData.location?.lat,
        longitude: alertData.location?.lng,
      } as never);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />
        
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
                <Ionicons name="location" size={20} color={COLORS.red} />
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
    backgroundColor: COLORS.red,
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  sirenIcon: {
    marginBottom: 20,
    // Add pulse animation if using Reanimated
  },
  emergencyText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  immediateText: {
    color: "rgba(255,255,255,0.8)",
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
    backgroundColor: "#F0F4D4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.jet,
  },
  childName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.jet,
  },
  timeText: {
    fontSize: 14,
    color: "rgba(28, 40, 38, 0.4)",
  },
  messageBox: {
    backgroundColor: "#FEF2F2",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 24,
  },
  messageContent: {
    fontSize: 18,
    color: COLORS.red,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 26,
  },
  locationBox: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 24,
    gap: 8,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(28, 40, 38, 0.3)",
    letterSpacing: 1,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.jet,
  },
  addressText: {
    fontSize: 14,
    color: "rgba(28, 40, 38, 0.5)",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
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
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
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
