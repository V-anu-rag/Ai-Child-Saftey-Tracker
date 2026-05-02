import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Vibration, ActivityIndicator, Modal, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Battery from "expo-battery";
import * as Location from "expo-location";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import { useSocket } from "../../context/SocketContext";
import { childrenAPI, alertsAPI } from "../../api/client";

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550",
  salmon: "#EA9E8D", jet: "#1C2826",
};

interface Child {
  _id: string; name: string; parentId: string;
}

export default function TrackingScreen() {
  const { user, logout } = useAuth();
  const { isConnected, emit } = useSocket();
  const [isTracking, setIsTracking] = useState(false);
  const [child, setChild] = useState<Child | null>(null);
  const [loadingChild, setLoadingChild] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await childrenAPI.getAll() as any;
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
      if (child && isTracking) emit("update-status", { childId: child._id, batteryLevel: pct });
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
    Alert.alert("🚨 SOS Alert", "Notify your parent with your current location?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send SOS", style: "destructive", onPress: async () => {
          if (child) {
            let lat = currentCoords?.lat;
            let lng = currentCoords?.lng;
            try {
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
              lat = loc.coords.latitude; lng = loc.coords.longitude;
            } catch {}
            await alertsAPI.triggerSOS({ childId: child._id, latitude: lat, longitude: lng, message: `${user?.name} has pressed the SOS button!` });
          }
        },
      },
    ]);
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
            <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]} 👋</Text>
            <Text style={styles.subGreeting}>Your safety dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => setShowProfileMenu(true)} style={styles.profileAvatar}>
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowProfileMenu(false)}>
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatarLarge}><Text style={styles.avatarTextLarge}>{userInitial}</Text></View>
                <View>
                  <Text style={styles.menuName}>{user?.name}</Text>
                  <Text style={styles.menuEmail}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowProfileMenu(false)}>
                <Ionicons name="person-outline" size={20} color={COLORS.jet} />
                <Text style={styles.menuItemText}>My Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowProfileMenu(false); logout(); }}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
                <Text style={[styles.menuItemText, { color: COLORS.red }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        <View style={[styles.statusBar, isConnected ? styles.statusOnline : styles.statusOffline]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.dot, { backgroundColor: isConnected ? "#16a34a" : "#ef4444" }]} />
            <Text style={styles.statusText}>{isConnected ? "Connected to server" : "Offline — reconnecting..."}</Text>
          </View>
          {!isConnected && (
            <TouchableOpacity 
              onPress={() => Alert.alert("Re-pair Device", "This will disconnect you from your parent. You will need a new pairing code to continue. Proceed?", [
                { text: "Cancel", style: "cancel" },
                { text: "Re-pair", style: "destructive", onPress: logout }
              ])}
              style={styles.repairButton}
            >
              <Text style={styles.repairButtonText}>Re-pair</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main tracking card */}
        <View style={styles.trackingCard}>
          <View style={styles.trackingTop}>
            <View style={styles.shieldIcon}><Ionicons name={isTracking ? "shield-checkmark" : "shield-outline"} size={40} color={isTracking ? "#16a34a" : COLORS.jet} /></View>
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Location Tracking</Text>
              <Text style={[styles.trackingStatus, { color: isTracking ? "#16a34a" : "#6b7280" }]}>{isTracking ? "● Active" : "○ Inactive"}</Text>
            </View>
            <Switch value={isTracking} onValueChange={() => setIsTracking(!isTracking)} trackColor={{ false: "#d1d5db", true: "#bbf7d0" }} thumbColor={isTracking ? "#16a34a" : "#9ca3af"} />
          </View>
          {isTracking && (
            <View style={styles.trackingDetails}>
              <View style={styles.detailRow}><Ionicons name="location" size={14} color={COLORS.red} /><Text style={styles.detailText}>{currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : "Acquiring GPS..."}</Text></View>
              {lastUpdate && <View style={styles.detailRow}><Ionicons name="time-outline" size={14} color="#6b7280" /><Text style={styles.detailText}>Last update: {lastUpdate.toLocaleTimeString()}</Text></View>}
            </View>
          )}
        </View>

        {/* Battery & Device */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Ionicons name={batteryLevel > 20 ? "battery-half" : "battery-dead"} size={24} color={batteryLevel < 20 ? COLORS.red : COLORS.jet} /><Text style={styles.statValue}>{batteryLevel}%</Text><Text style={styles.statLabel}>Battery</Text></View>
          <View style={styles.statCard}><Ionicons name="phone-portrait-outline" size={24} color={COLORS.jet} /><Text style={styles.statValue} numberOfLines={1}>{child?.name || "Unpaired"}</Text><Text style={styles.statLabel}>Profile</Text></View>
        </View>

        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
          <View style={styles.sosInner}><Ionicons name="warning" size={32} color="#FFFFFF" /><Text style={styles.sosText}>SOS</Text><Text style={styles.sosCaption}>Hold for emergency</Text></View>
        </TouchableOpacity>
        <Text style={styles.safetyNote}>🔒 Your location is only shared with your parent.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.jet },
  subGreeting: { fontSize: 13, color: `${COLORS.jet}80`, marginTop: 2 },
  profileAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.jet, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", alignItems: "flex-end", padding: 16, paddingTop: 60 },
  menuContainer: { backgroundColor: "#fff", width: 250, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  menuHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  menuAvatarLarge: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.jet, alignItems: "center", justifyContent: "center" },
  avatarTextLarge: { color: "#fff", fontWeight: "700", fontSize: 20 },
  menuName: { fontSize: 16, fontWeight: "800", color: COLORS.jet },
  menuEmail: { fontSize: 11, color: `${COLORS.jet}60` },
  menuDivider: { height: 1, backgroundColor: `${COLORS.jet}10`, marginVertical: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  menuItemText: { fontSize: 14, fontWeight: "600", color: COLORS.jet },
  statusBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 16 },
  statusOnline: { backgroundColor: "#dcfce7" },
  statusOffline: { backgroundColor: "#fee2e2" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "600", color: COLORS.jet },
  trackingCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  trackingTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  shieldIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
  trackingInfo: { flex: 1 },
  trackingLabel: { fontSize: 16, fontWeight: "700", color: COLORS.jet },
  trackingStatus: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  trackingDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.green, gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 12, color: `${COLORS.jet}80` },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", gap: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 15, fontWeight: "800", color: COLORS.jet },
  statLabel: { fontSize: 11, color: `${COLORS.jet}60` },
  sosButton: { backgroundColor: COLORS.red, borderRadius: 24, marginBottom: 20, overflow: "hidden", shadowColor: COLORS.red, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  sosInner: { paddingVertical: 28, alignItems: "center", gap: 4 },
  sosText: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: 4 },
  sosCaption: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  safetyNote: { textAlign: "center", fontSize: 12, color: `${COLORS.jet}60`, lineHeight: 18, marginTop: 10 },
  repairButton: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.red },
  repairButtonText: { color: COLORS.red, fontSize: 11, fontWeight: "700" },
});
