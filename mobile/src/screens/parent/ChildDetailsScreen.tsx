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

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550",
  salmon: "#EA9E8D", jet: "#1C2826",
};

export default function ChildDetailsScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { on, off } = useSocket();
  const [child, setChild] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
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

  const initialRegion = useMemo(() => {
    return {
      latitude: child?.lastLocation?.lat || 28.6139,
      longitude: child?.lastLocation?.lng || 77.2090,
    };
  }, [child?.id]); // Only change if the child being viewed changes

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.red} />
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
          <Ionicons name="trash-outline" size={20} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
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
              <View style={[styles.statusDot, { backgroundColor: child?.isOnline ? "#16a34a" : "#9ca3af" }]} />
              <Text style={styles.statVal}>{child?.isOnline ? "Online" : "Offline"}</Text>
              <Text style={styles.statLab}>Status</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Activity Timeline</Text>
        {activities.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.type === "alert" ? "#fee2e2" : "#dcfce7" }]}>
              <Ionicons name={item.type === "alert" ? "warning" : "location"} size={18} color={item.type === "alert" ? COLORS.red : "#16a34a"} />
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
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  deleteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },
  mapContainer: { width: "100%", height: 200, backgroundColor: "#e5e7eb" },
  map: { width: "100%", height: "100%" },
  marker: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.red, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  summaryCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, margin: 20, marginTop: -24, elevation: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  stat: { alignItems: "center", gap: 4 },
  statVal: { fontSize: 16, fontWeight: "800", color: COLORS.jet },
  statLab: { fontSize: 10, color: `${COLORS.jet}60` },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  divider: { width: 1, height: 30, backgroundColor: COLORS.green },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: COLORS.jet, marginLeft: 20, marginBottom: 12 },
  activityItem: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginHorizontal: 20, marginBottom: 12, alignItems: "center", gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: "700", color: COLORS.jet },
  activityMsg: { fontSize: 12, color: `${COLORS.jet}60` },
  activityTime: { fontSize: 10, color: `${COLORS.jet}40`, marginTop: 4 },
});
