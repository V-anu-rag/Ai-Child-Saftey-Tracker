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

const statusColor = { safe: "#16a34a", warning: "#d97706", alert: "#dc2626" };
const statusBg = { safe: "#dcfce7", warning: "#fef9c3", alert: "#fee2e2" };

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
              <View style={[styles.connDot, { backgroundColor: isConnected ? "#16a34a" : "#ef4444" }]} />
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
            { icon: "checkmark-circle", label: "Safe", value: children.filter((c) => c.safeStatus === "safe").length, color: "#16a34a" },
            { icon: "notifications", label: "Alerts", value: unreadCount, color: COLORS.danger },
            { icon: "wifi", label: "Online", value: children.filter((c) => c.isOnline).length, color: "#2563eb" },
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
                  <View style={[styles.onlineDot, { backgroundColor: child.isOnline ? "#16a34a" : "#9ca3af" }]} />
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
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  connRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  connDot: { width: 6, height: 6, borderRadius: 3 },
  connText: { fontSize: 12, color: COLORS.textMuted },
  profileAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.text, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "transparent", justifyContent: "flex-start", alignItems: "flex-end", paddingRight: 16, paddingTop: 60 },
  menuContainer: { backgroundColor: "#fff", width: 208, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  menuInner: { paddingVertical: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 16 },
  menuItemText: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  menuItemSignOut: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12, alignItems: "center", gap: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  addText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  empty: { backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "700", color: COLORS.textMuted },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  childCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  childTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center", position: "relative" },
  onlineDot: { position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
  childInfo: { flex: 1 },
  childName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  childMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  locationText: { flex: 1, fontSize: 11, color: COLORS.textMuted },
});
