import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Vibration,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Battery from "expo-battery";
import * as Location from "expo-location";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import { useSocket } from "../../context/SocketContext";
import { childrenAPI, alertsAPI } from "../../api/client";

import { COLORS } from "../../constants/theme";

interface Child {
  _id: string;
  name: string;
  parentId: string;
}

export default function TrackingScreen() {
  const { user, logout } = useAuth();
  const { isConnected, emit } = useSocket();
  const [isTracking, setIsTracking] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [loadingChild, setLoadingChild] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = (await childrenAPI.getAll()) as any;
        if (res.children?.length) setChild(res.children[0]);
      } catch (err) {
        console.warn("Could not fetch child profile:", err);
      } finally {
        setLoadingChild(false);
      }
    };
    fetchChild();
  }, []);

  useEffect(() => {
    Battery.getBatteryLevelAsync().then((level) => {
      setBatteryLevel(Math.round(level * 100));
    });
    const sub = Battery.addBatteryLevelListener(({ batteryLevel: lvl }) => {
      const pct = Math.round(lvl * 100);
      setBatteryLevel(pct);
      if (child && isTracking)
        emit("update-status", { childId: child._id, batteryLevel: pct });
    });
    return () => sub.remove();
  }, [child, isTracking]);

  const handleLocationUpdate = useCallback((coords: any) => {
    setCurrentCoords({ lat: coords.latitude, lng: coords.longitude });
    setLastUpdate(new Date());
  }, []);

  useLocation({
    childId: child?._id || "",
    enabled: isTracking && !!child,
    batteryLevel,
    onLocationUpdate: handleLocationUpdate,
  });

  const handleSOS = () => {
    Vibration.vibrate([0, 200, 100, 200]);
    Alert.alert(
      "🚨 SOS Alert",
      "Notify your parent with your current location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            if (child) {
              let lat = currentCoords?.lat;
              let lng = currentCoords?.lng;
              try {
                const loc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });
                lat = loc.coords.latitude;
                lng = loc.coords.longitude;
              } catch {}
              await alertsAPI.triggerSOS({
                childId: child._id,
                latitude: lat,
                longitude: lng,
                message: `${user?.name} has pressed the SOS button!`,
              });
            }
          },
        },
      ],
    );
  };

  if (loadingChild) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.red} />
      </View>
    );
  }

  const userInitial = user?.name?.charAt(0) || "C";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(" ")[0]} 👋
            </Text>
            <Text style={styles.subGreeting}>Your safety dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowProfileMenu(true)}
            style={styles.profileAvatar}
          >
            <Text style={styles.avatarText}>{userInitial}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Menu Modal */}
        <Modal
          visible={showProfileMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowProfileMenu(false)}
          >
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatarLarge}>
                  <Text style={styles.avatarTextLarge}>{userInitial}</Text>
                </View>
                <View>
                  <Text style={styles.menuName}>{user?.name}</Text>
                  <Text style={styles.menuEmail}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowProfileMenu(false)}
              >
                <Ionicons name="person-outline" size={20} color={COLORS.jet} />
                <Text style={styles.menuItemText}>My Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
                <Text style={[styles.menuItemText, { color: COLORS.red }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Connection status */}
        <View
          style={[
            styles.statusBar,
            isConnected ? styles.statusOnline : styles.statusOffline,
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: isConnected ? COLORS.salmon : COLORS.red },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? "Live Protection Active" : "Offline — reconnecting..."}
          </Text>
        </View>

        {/* Tracking functionality is still active in the background, but the UI card is removed as per requirements */}


        {/* Battery & Device */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons
              name={batteryLevel > 20 ? "battery-half" : "battery-dead"}
              size={24}
              color={batteryLevel < 20 ? COLORS.red : COLORS.jet}
            />
            <Text style={styles.statValue}>{batteryLevel}%</Text>
            <Text style={styles.statLabel}>Battery</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color={COLORS.jet}
            />
            <Text style={styles.statValue} numberOfLines={1}>
              {child?.name || "Unpaired"}
            </Text>
            <Text style={styles.statLabel}>Profile</Text>
          </View>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOS}
          activeOpacity={0.8}
        >
          <View style={styles.sosInner}>
            <Ionicons name="warning" size={32} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosCaption}>Hold for emergency</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.safetyNote}>
          🛡️ Your location is only shared securely with your parent.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  scroll: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { fontSize: 24, fontWeight: "800", color: COLORS.jet, letterSpacing: -0.5 },
  subGreeting: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.jet,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.jet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  menuContainer: {
    backgroundColor: "#fff",
    width: 250,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.jet,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  menuAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.jet,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextLarge: { color: "#fff", fontWeight: "700", fontSize: 20 },
  menuName: { fontSize: 16, fontWeight: "800", color: COLORS.jet },
  menuEmail: { fontSize: 11, color: COLORS.textMuted },
  menuDivider: { height: 1, backgroundColor: COLORS.green, marginVertical: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  menuItemText: { fontSize: 14, fontWeight: "600", color: COLORS.jet },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  statusOnline: { backgroundColor: "rgba(0, 212, 170, 0.08)" },
  statusOffline: { backgroundColor: "rgba(99, 91, 255, 0.08)" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: "700", color: COLORS.jet },
  statsRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 6,
    shadowColor: COLORS.jet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  sosButton: {
    backgroundColor: COLORS.red,
    borderRadius: 32,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  sosInner: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 6,
  },
  sosText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 6,
    textTransform: "uppercase",
  },
  sosCaption: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)", fontWeight: "600" },
  safetyNote: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
