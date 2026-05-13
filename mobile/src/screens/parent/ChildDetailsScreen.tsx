import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FreeMap from "../../components/FreeMap";
import { useSocket } from "../../context/SocketContext";
import { childrenAPI, activityAPI, geofencesAPI } from "../../api/client";
import { COLORS } from "../../constants/theme";

const { width } = Dimensions.get("window");

interface Child {
  _id: string;
  id?: string;
  name: string;
  pairingCode?: string;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  batteryLevel?: number;
  isOnline?: boolean;
}

interface Activity {
  id: string;
  type: "location" | "alert" | string;
  title: string;
  message: string;
  timestamp: string;
  coords?: { lat: number; lng: number };
}

interface Geofence {
  _id: string;
  center: { lat: number; lng: number };
  radius: number;
  color?: string;
}


export default function ChildDetailsScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { on, off } = useSocket();
  const [child, setChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [childRes, activityRes, geoRes] = await Promise.all([
        childrenAPI.getOne(childId) as any,
        activityAPI.get(childId) as any,
        geofencesAPI.getAll({ childId }) as any
      ]);
      setChild(childRes.child);
      setActivities(activityRes.timeline || []);
      setGeofences(geoRes.geofences || []);
    } catch (err) {
      console.error("Fetch details error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
    const handleLocation = (data: any) => {
      if (data.childId !== childId) return;
      setChild(prev => prev ? { ...prev, lastLocation: { lat: data.latitude, lng: data.longitude, timestamp: data.timestamp }, batteryLevel: data.batteryLevel ?? prev.batteryLevel, isOnline: true } : null);
      setActivities(prev => [{ id: Math.random().toString(), type: "location", title: "Location Update", message: "Updated current position", timestamp: data.timestamp, coords: { lat: data.latitude, lng: data.longitude } }, ...prev].slice(0, 20));
    };
    const handleAlert = (data: any) => {
      if (data.childId !== childId) return;
      setActivities(prev => [{ id: data._id, type: "alert", title: data.title, message: data.message, timestamp: data.createdAt }, ...prev].slice(0, 20));
    };
    on("location-update", handleLocation);
    on("alert-received", handleAlert);
    return () => {
      off("location-update", handleLocation);
      off("alert-received", handleAlert);
    };
  }, [childId, on, off, fetchData]);

  const handleDelete = () => {
    Alert.alert(
      "Remove Child?",
      "Are you sure? This will unpair the device and delete history.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            const res = await childrenAPI.remove(childId) as any;
            if (res.success) navigation.navigate("DashboardMain");
            else setLoading(false);
          }
        }
      ]
    );
  };

  const handleRegenerateCode = async () => {
    try {
      setRefreshing(true);
      const res = await childrenAPI.regenerateCode(childId) as any;
      if (res.success) {
        setChild(prev => prev ? { ...prev, pairingCode: res.pairingCode } : null);
        Alert.alert("Success", "Pairing code regenerated successfully.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to regenerate pairing code.");
    } finally {
      setRefreshing(false);
    }
  };

  const initialRegion = useMemo(() => {
    return {
      latitude: child?.lastLocation?.lat || 28.6139,
      longitude: child?.lastLocation?.lng || 77.2090,
    };
  }, [child?.id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.jet} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child?.name}'s Activity</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        <View style={styles.mapContainer}>
          <FreeMap
            scrollEnabled={false}
            initialRegion={initialRegion}
            childrenLocations={child?.lastLocation?.lat ? [{
              id: child._id,
              latitude: child.lastLocation.lat,
              longitude: child.lastLocation.lng,
              name: child.name
            }] : []}
            geofences={geofences.map(zone => ({
              id: zone._id,
              latitude: zone.center.lat,
              longitude: zone.center.lng,
              radius: zone.radius,
              color: zone.color || COLORS.salmon
            }))}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.stat}>
              <Ionicons name="battery-charging" size={20} color={COLORS.jet} />
              <Text style={styles.statVal}>{child?.batteryLevel ?? "--"}%</Text>
              <Text style={styles.statLab}>Battery</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <View style={[styles.statusDot, { backgroundColor: child?.isOnline ? COLORS.salmon : "#9ca3af" }]} />
              <Text style={styles.statVal}>{child?.isOnline ? "Online" : "Offline"}</Text>
              <Text style={styles.statLab}>Status</Text>
            </View>
          </View>
        </View>

        <View style={styles.pairingCard}>
          <View style={styles.pairingInfo}>
            <View style={styles.keyIcon}><Ionicons name="key" size={20} color={COLORS.primary} /></View>
            <View>
              <Text style={styles.pairingLabel}>Pairing Code</Text>
              <Text style={styles.pairingCode}>{child?.pairingCode || "--- ---"}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.regenBtn} 
            onPress={handleRegenerateCode}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.regenText}>Regenerate</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Activity Timeline</Text>
        {activities.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.type === "alert" ? "rgba(255, 77, 77, 0.1)" : "rgba(0, 212, 170, 0.1)" }]}>
              <Ionicons name={item.type === "alert" ? "warning" : "location"} size={18} color={item.type === "alert" ? COLORS.danger : COLORS.salmon} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityMsg}>{item.message}</Text>
              <Text style={styles.activityTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.green, shadowColor: COLORS.jet, shadowOpacity: 0.05, shadowRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: COLORS.jet, letterSpacing: -0.5 },
  deleteBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255, 77, 77, 0.08)", alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },
  mapContainer: { width: "100%", height: 220, backgroundColor: COLORS.green },
  summaryCard: { backgroundColor: "#fff", borderRadius: 28, padding: 24, margin: 20, marginTop: -32, elevation: 6, shadowColor: COLORS.jet, shadowOpacity: 0.08, shadowRadius: 15, borderWidth: 1, borderColor: COLORS.green },
  summaryRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  stat: { alignItems: "center", gap: 6 },
  statVal: { fontSize: 18, fontWeight: "900", color: COLORS.jet },
  statLab: { fontSize: 11, color: COLORS.textMuted, fontWeight: "700", textTransform: "uppercase" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  divider: { width: 1, height: 40, backgroundColor: COLORS.green },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet, marginLeft: 24, marginBottom: 16, marginTop: 8 },
  activityItem: { flexDirection: "row", backgroundColor: "#fff", padding: 18, borderRadius: 24, marginHorizontal: 20, marginBottom: 12, alignItems: "center", gap: 14, borderWidth: 1, borderColor: COLORS.green, shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  activityIcon: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  activityContent: { flex: 1, gap: 2 },
  activityTitle: { fontSize: 15, fontWeight: "800", color: COLORS.jet },
  activityMsg: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  activityTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: "600" },
  pairingCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginHorizontal: 20, marginBottom: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.green, shadowColor: COLORS.jet, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  pairingInfo: { flexDirection: "row", alignItems: "center", gap: 16 },
  keyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(99, 91, 255, 0.08)", alignItems: "center", justifyContent: "center" },
  pairingLabel: { fontSize: 11, fontWeight: "900", color: COLORS.textMuted, textTransform: "uppercase" },
  pairingCode: { fontSize: 20, fontWeight: "900", color: COLORS.jet, letterSpacing: 3 },
  regenBtn: { backgroundColor: COLORS.primary, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  regenText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
