import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { childrenAPI, alertsAPI } from "../../api/client";
import { COLORS } from "../../constants/theme";

interface Child {
  _id: string; name: string; age: number; isOnline: boolean;
  batteryLevel: number; safeStatus: "safe" | "warning" | "alert";
  lastLocation: { lat: number; lng: number; address: string; timestamp: string } | null;
}

const statusColor = { safe: COLORS.salmon, warning: "#FACC15", alert: COLORS.danger };
const statusBg = { safe: "rgba(0,212,170,0.1)", warning: "rgba(250,204,21,0.1)", alert: "rgba(255,77,77,0.1)" };

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { isConnected, on, off } = useSocket();
  const [children, setChildren] = useState<Child[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [childRes, alertRes] = await Promise.all([
        childrenAPI.getAll() as any,
        alertsAPI.getAll({ unread: true, limit: 1 }) as any,
      ]);
      setChildren(childRes.children || []);
      setUnreadCount(alertRes.unreadCount || 0);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const handleLocation = (data: any) => {
      setChildren((prev) => prev.map((c) => c._id === data.childId ? { ...c, isOnline: true, batteryLevel: data.batteryLevel ?? c.batteryLevel, lastLocation: { lat: data.latitude, lng: data.longitude, address: c.lastLocation?.address || "", timestamp: data.timestamp } } : c));
    };
    const handleStatus = (data: any) => {
      setChildren((prev) => prev.map((c) => c._id === data.childId ? { ...c, isOnline: data.isOnline, batteryLevel: data.batteryLevel ?? c.batteryLevel } : c));
    };
    const handleAlert = () => { setUnreadCount((n) => n + 1); };

    on("location-update", handleLocation);
    on("child-status", handleStatus);
    on("alert-received", handleAlert);
    return () => {
      off("location-update", handleLocation);
      off("child-status", handleStatus);
      off("alert-received", handleAlert);
    };
  }, [on, off]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  const userInitial = user?.name?.charAt(0) || "U";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {user?.name?.split(" ")[0]?.toUpperCase()}</Text>
            <View style={styles.connRow}>
              <View style={[styles.connDot, { backgroundColor: isConnected ? COLORS.salmon : COLORS.danger }]} />
              <Text style={styles.connText}>{isConnected ? "Live tracking active" : "Reconnecting..."}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowProfileMenu(true)} 
              style={styles.profileAvatar}
            >
              <Text style={styles.avatarText}>{userInitial}</Text>
            </TouchableOpacity>
          </View>
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
              <View style={styles.menuInner}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowProfileMenu(false); navigation.navigate("Settings", { tab: "profile" }); }} activeOpacity={0.7}>
                  <Ionicons name="person-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.menuItemText}>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowProfileMenu(false); navigation.navigate("Settings", { tab: "security" }); }} activeOpacity={0.7}>
                  <Ionicons name="settings-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, styles.menuItemSignOut]} onPress={() => { setShowProfileMenu(false); logout(); }} activeOpacity={0.7}>
                  <Ionicons name="log-out-outline" size={16} color={COLORS.danger} />
                  <Text style={[styles.menuItemText, { color: COLORS.danger }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: "people", label: "Children", value: children.length, color: COLORS.primary },
            { icon: "checkmark-circle", label: "Safe", value: children.filter((c) => c.safeStatus === "safe").length, color: COLORS.salmon },
            { icon: "notifications", label: "Alerts", value: unreadCount, color: COLORS.danger },
            { icon: "wifi", label: "Online", value: children.filter((c) => c.isOnline).length, color: COLORS.primary },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Children</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AddChild")}>
            <Text style={styles.addText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No children added yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("AddChild")}>
              <Text style={styles.emptyBtnText}>Add Your First Child</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity key={child._id} style={styles.childCard} onPress={() => navigation.navigate("ChildDetails", { childId: child._id })}>
              <View style={styles.childTop}>
                <View style={styles.avatarBox}>
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                  <View style={[styles.onlineDot, { backgroundColor: child.isOnline ? COLORS.salmon : "#9ca3af" }]} />
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>Age {child.age} · Battery {child.batteryLevel ?? "—"}%</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg[child.safeStatus] }]}><Text style={[styles.statusText, { color: statusColor[child.safeStatus] }]}>{child.safeStatus}</Text></View>
              </View>
              {child.lastLocation && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.locationText} numberOfLines={1}>{child.lastLocation.address || `${child.lastLocation.lat?.toFixed(4)}, ${child.lastLocation.lng?.toFixed(4)}`}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: { fontSize: 24, fontWeight: "900", color: COLORS.jet, letterSpacing: -0.5 },
  connRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  profileAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.jet, alignItems: "center", justifyContent: "center", shadowColor: COLORS.jet, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-start", alignItems: "flex-end", paddingRight: 16, paddingTop: 60 },
  menuContainer: { backgroundColor: "#fff", width: 220, borderRadius: 24, shadowColor: COLORS.jet, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  menuInner: { paddingVertical: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 20 },
  menuItemText: { fontSize: 14, fontWeight: "600", color: COLORS.jet },
  menuItemSignOut: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 20, padding: 16, alignItems: "center", gap: 6, shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: COLORS.green },
  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "700", textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  addText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  empty: { backgroundColor: "#fff", borderRadius: 24, padding: 40, alignItems: "center", gap: 16, shadowColor: COLORS.jet, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: COLORS.green },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  childCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: COLORS.jet, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: COLORS.green },
  childTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center", position: "relative" },
  onlineDot: { position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: "#fff" },
  childInfo: { flex: 1 },
  childName: { fontSize: 17, fontWeight: "800", color: COLORS.jet },
  childMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.green },
  locationText: { flex: 1, fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
});
