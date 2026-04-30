import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSocket } from "../../context/SocketContext";
import { alertsAPI } from "../../api/client";
import { formatDistanceToNow } from "../../utils/dateUtils";

const COLORS = { bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550", salmon: "#EA9E8D", jet: "#1C2826" };

const severityColors = {
  low: { bg: "#dcfce7", text: "#16a34a", dot: "#16a34a" },
  medium: { bg: "#fef9c3", text: "#d97706", dot: "#d97706" },
  high: { bg: "#ffedd5", text: "#ea580c", dot: "#ea580c" },
  critical: { bg: "#fee2e2", text: "#dc2626", dot: "#dc2626" },
};

const typeIcons: Record<string, string> = {
  sos: "warning", geofence_exit: "location", geofence_enter: "checkmark-circle",
  low_battery: "battery-dead", device_offline: "phone-portrait", app_usage: "apps",
};

const FILTERS = ["all", "critical", "high", "medium", "low", "unread"] as const;

export default function AlertsScreen() {
  const { on, off } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const params: any = {};
      if (filter === "unread") params.unread = true;
      else if (filter !== "all") params.severity = filter;
      const res = await alertsAPI.getAll(params) as any;
      setAlerts(res.alerts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchAlerts(); }, [filter]);

  // Live alert push
  useEffect(() => {
    const handler = (alert: any) => {
      setAlerts((prev) => [alert, ...prev]);
    };
    on("alert-received", handler as any);
    return () => off("alert-received", handler as any);
  }, [on, off]);

  const markRead = async (id: string) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, isRead: true } : a));
    } catch {}
  };

  const renderAlert = ({ item }: any) => {
    const sev = severityColors[item.severity as keyof typeof severityColors] || severityColors.medium;
    const icon = typeIcons[item.type] || "alert-circle";

    return (
      <TouchableOpacity
        style={[styles.alertCard, !item.isRead && styles.alertUnread]}
        onPress={() => markRead(item._id)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconBox, { backgroundColor: sev.bg }]}>
          <Ionicons name={icon as any} size={20} color={sev.text} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertRow}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
            {!item.isRead && <View style={[styles.dot, { backgroundColor: COLORS.red }]} />}
          </View>
          <Text style={styles.alertMessage} numberOfLines={2}>{item.message}</Text>
          <View style={styles.alertMeta}>
            <Text style={styles.alertChild}>
              {item.childId?.name || "Unknown"}
            </Text>
            <Text style={styles.alertTime}>
              {formatDistanceToNow(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={[styles.severity, { backgroundColor: sev.bg }]}>
          <Text style={[styles.severityText, { color: sev.text }]}>{item.severity}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Alerts</Text>

      {/* Filters */}
      <FlatList
        data={FILTERS as unknown as string[]}
        horizontal
        style={{ flexGrow: 0 }}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === item && styles.filterActive]}
            onPress={() => setFilter(item as typeof FILTERS[number])}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="small" color={COLORS.red} />
      ) : (
        <FlatList
          data={alerts}
          style={{ flex: 1 }}
          keyExtractor={(a) => a._id}
          renderItem={renderAlert}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} tintColor={COLORS.red} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle" size={28} color={`${COLORS.jet}30`} />
              <Text style={styles.emptyText}>No alerts</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.jet, padding: 20, paddingBottom: 12 },
  filtersRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.green },
  filterActive: { backgroundColor: COLORS.jet, borderColor: COLORS.jet },
  filterText: { fontSize: 13, fontWeight: "600", color: `${COLORS.jet}70` },
  filterTextActive: { color: "#fff" },
  alertCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", gap: 12, alignItems: "flex-start", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  alertUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.red, backgroundColor: "#fff8f8" },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  alertContent: { flex: 1, gap: 3 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: COLORS.jet },
  dot: { width: 6, height: 6, borderRadius: 3 },
  alertMessage: { fontSize: 12, color: `${COLORS.jet}70`, lineHeight: 16 },
  alertMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  alertChild: { fontSize: 11, fontWeight: "600", color: COLORS.salmon },
  alertTime: { fontSize: 11, color: `${COLORS.jet}50` },
  severity: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" },
  severityText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600", color: `${COLORS.jet}50` },
});
