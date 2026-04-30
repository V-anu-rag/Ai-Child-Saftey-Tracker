import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FreeMap, { FreeMapRef } from "../../components/FreeMap";
import { useSocket } from "../../context/SocketContext";
import { childrenAPI, geofencesAPI } from "../../api/client";

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550", salmon: "#EA9E8D", jet: "#1C2826",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_LARGE_SCREEN = SCREEN_WIDTH > 400;

interface LocationData {
  childId: string; latitude: number; longitude: number;
  accuracy?: number; batteryLevel?: number; timestamp: string;
}

export default function MapScreen() {
  // Keep screen awake while on map
  useEffect(() => {
    let active = true;
    const activate = async () => {
      try {
        if (active) await activateKeepAwakeAsync();
      } catch (e) {
        console.warn("KeepAwake could not be activated:", e);
      }
    };
    activate();
    return () => {
      active = false;
      deactivateKeepAwake();
    };
  }, []);
  const { on, off } = useSocket();
  const mapRef = useRef<FreeMapRef>(null);
  const route = useRoute<any>();
  const [children, setChildren] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [childRes, geoRes] = await Promise.all([
        childrenAPI.getAll() as any,
        geofencesAPI.getAll({ active: true }) as any,
      ]);
      const kids = childRes.children || [];
      setChildren(kids);
      setGeofences(geoRes.geofences || []);

      // Seed initial locations from lastLocation
      const initial: Record<string, LocationData> = {};
      kids.forEach((c: any) => {
        if (c.lastLocation?.lat) {
          initial[c._id] = {
            childId: c._id,
            latitude: c.lastLocation.lat,
            longitude: c.lastLocation.lng,
            timestamp: c.lastLocation.timestamp,
          };
        }
      });
      setLocations(initial);

      // Fly to first child
      const first = kids.find((c: any) => c.lastLocation?.lat);
      if (first) {
        mapRef.current?.flyTo(first.lastLocation.lat, first.lastLocation.lng, 15);
      }
    } catch (err) {
      console.error("Map data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData().then(() => {
      // Check for route params (coming from SOS modal)
      if (route.params?.childId) {
        setSelectedChild(route.params.childId);
        if (route.params.latitude && route.params.longitude) {
          setTimeout(() => {
            mapRef.current?.flyTo(route.params.latitude, route.params.longitude, 15);
          }, 1500);
        }
      }
    }); 
  }, [route.params]);

  // Live location updates
  useEffect(() => {
    const handleLocation = (data: LocationData) => {
      setLocations((prev) => ({ ...prev, [data.childId]: data }));
      // Animate map to updated child if selected
      if (selectedChild === data.childId) {
        mapRef.current?.flyTo(data.latitude, data.longitude, 15);
      }
    };

    on("location-update", handleLocation as any);
    return () => off("location-update", handleLocation as any);
  }, [selectedChild, on, off]);

  const focusChild = (childId: string) => {
    setSelectedChild(childId);
    const loc = locations[childId];
    if (loc) {
      mapRef.current?.flyTo(loc.latitude, loc.longitude, 15);
    }
  };

  const initialRegion = useMemo(() => {
    const first = children.find(c => c.lastLocation?.lat);
    return {
      latitude: first?.lastLocation?.lat || 28.6139,
      longitude: first?.lastLocation?.lng || 77.2090,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [children.length > 0]); // Only re-calculate when the first child is found

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.red} />
      </View>
    );
  }

  const hasLocationData = children.some(c => c.lastLocation?.lat);

  if (children.length > 0 && !hasLocationData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.jet} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Map</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loader}>
          <Ionicons name="map-outline" size={48} color={`${COLORS.jet}20`} />
          <Text style={styles.emptyText}>Waiting for child's location...</Text>
          <Text style={styles.emptySub}>Make sure the child device is online.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Map */}
      <FreeMap
        ref={mapRef}
        initialRegion={initialRegion}
        childrenLocations={children.map((c) => {
          const loc = locations[c._id];
          return {
            id: c._id,
            latitude: loc?.latitude || c.lastLocation?.lat || initialRegion.latitude,
            longitude: loc?.longitude || c.lastLocation?.lng || initialRegion.longitude,
            name: c.name,
            batteryLevel: loc?.batteryLevel ?? c.batteryLevel,
            timestamp: loc?.timestamp,
          };
        })}
        geofences={geofences.map((zone) => ({
          id: zone._id,
          latitude: zone.center.lat,
          longitude: zone.center.lng,
          radius: zone.radius,
          color: zone.color || COLORS.salmon,
          name: zone.name,
        }))}
        onMarkerPress={focusChild}
      />

      {/* Child selector pill */}
      {children.length > 0 && (
        <View style={styles.childPills}>
          <TouchableOpacity
            style={[styles.pill, !selectedChild && styles.pillActive]}
            onPress={() => setSelectedChild(null)}
          >
            <Text style={[styles.pillText, !selectedChild && styles.pillTextActive]}>All</Text>
          </TouchableOpacity>
          {children.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[styles.pill, selectedChild === c._id && styles.pillActive]}
              onPress={() => focusChild(c._id)}
            >
              <View style={[styles.pillDot, { backgroundColor: c.isOnline ? "#16a34a" : "#9ca3af" }]} />
              <Text style={[styles.pillText, selectedChild === c._id && styles.pillTextActive]}>
                {c.name.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: COLORS.bg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg, padding: 20 },
  emptyText: { fontSize: 18, fontWeight: "800", color: COLORS.jet, marginTop: 16 },
  emptySub: { fontSize: 14, color: `${COLORS.jet}60`, marginTop: 4, textAlign: "center" },
  map: { flex: 1 },
  markerOuter: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.red, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  markerSelected: { width: 48, height: 48, borderRadius: 24, borderWidth: 3 },
  markerInner: { alignItems: "center", justifyContent: "center" },
  zoneDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  callout: { padding: 8, minWidth: 120 },
  calloutName: { fontWeight: "700", fontSize: 13, color: COLORS.jet, marginBottom: 2 },
  calloutText: { fontSize: 11, color: `${COLORS.jet}70` },
  childPills: { 
    position: "absolute", 
    bottom: IS_LARGE_SCREEN ? 32 : 24, 
    left: 16, 
    right: 16, 
    flexDirection: "row", 
    gap: IS_LARGE_SCREEN ? 12 : 8, 
    flexWrap: "wrap", 
    justifyContent: "center" 
  },
  pill: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    backgroundColor: "#fff", 
    paddingHorizontal: IS_LARGE_SCREEN ? 18 : 14, 
    paddingVertical: IS_LARGE_SCREEN ? 10 : 8, 
    borderRadius: 24, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3 
  },
  pillActive: { backgroundColor: COLORS.jet },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { 
    fontSize: IS_LARGE_SCREEN ? 14 : 13, 
    fontWeight: "700", 
    color: COLORS.jet 
  },
  pillTextActive: { color: "#fff" },
});
