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
import { COLORS } from "../../constants/theme";

const severityColors = {
  low: { bg: "rgba(0, 212, 170, 0.1)", text: COLORS.salmon, dot: COLORS.salmon },
  medium: { bg: "rgba(99, 91, 255, 0.1)", text: COLORS.primary, dot: COLORS.primary },
  high: { bg: "rgba(251, 146, 60, 0.1)", text: "#FB923C", dot: "#FB923C" },
  critical: { bg: "rgba(255, 77, 77, 0.1)", text: COLORS.danger, dot: COLORS.danger },
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
            {!item.isRead && <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />}
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
        <ActivityIndicator style={{ flex: 1 }} size="small" color={COLORS.primary} />
      ) : (
        <FlatList
          data={alerts}
          style={{ flex: 1 }}
          keyExtractor={(a) => a._id}
          renderItem={renderAlert}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} tintColor={COLORS.primary} />}
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
  title: { fontSize: 24, fontWeight: "900", color: COLORS.jet, padding: 24, paddingBottom: 16, letterSpacing: -0.5 },
  filtersRow: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.green, shadowColor: COLORS.jet, shadowOpacity: 0.02, shadowRadius: 5 },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  filterText: { fontSize: 14, fontWeight: "700", color: COLORS.textMuted },
  filterTextActive: { color: "#fff" },
  alertCard: { backgroundColor: "#fff", borderRadius: 24, padding: 18, flexDirection: "row", gap: 14, alignItems: "flex-start", shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: COLORS.green },
  alertUnread: { borderLeftWidth: 4, borderLeftColor: COLORS.danger, backgroundColor: "rgba(255, 77, 77, 0.01)" },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  alertContent: { flex: 1, gap: 4 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: COLORS.jet },
  dot: { width: 8, height: 8, borderRadius: 4 },
  alertMessage: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, fontWeight: "500" },
  alertMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  alertChild: { fontSize: 12, fontWeight: "800", color: COLORS.primary, textTransform: "uppercase" },
  alertTime: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  severity: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" },
  severityText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 16 },
  emptyText: { fontSize: 17, fontWeight: "700", color: COLORS.textMuted },
});
