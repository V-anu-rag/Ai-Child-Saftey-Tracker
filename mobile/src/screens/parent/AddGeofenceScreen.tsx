import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FreeMap, { FreeMapRef } from "../../components/FreeMap";
import { Ionicons } from "@expo/vector-icons";
import { geofencesAPI, childrenAPI } from "../../api/client";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550",
  salmon: "#EA9E8D", jet: "#1C2826",
};

const TYPES = [
  { id: "home", label: "Home", icon: "home" },
  { id: "school", label: "School", icon: "school" },
  { id: "custom", label: "Custom", icon: "shield" },
];

export default function AddGeofenceScreen({ navigation }: any) {
  const mapRef = React.useRef<FreeMapRef>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allowScroll, setAllowScroll] = useState(true);

  const [name, setName] = useState("");
  const [radius, setRadius] = useState(200);
  const [type, setType] = useState("custom");
  const [childId, setChildId] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    childrenAPI.getAll().then((res: any) => {
      setChildren(res.children || []);
    });
  }, []);

  const selectChild = (id: string) => {
    setChildId(id);
    const child = children.find(c => c._id === id);
    if (child?.lastLocation?.lat) {
      const loc = { lat: child.lastLocation.lat, lng: child.lastLocation.lng };
      setLocation(loc);
      // Give the WebView a moment to be ready if it's the first load
      setTimeout(() => {
        mapRef.current?.flyTo(loc.lat, loc.lng, 16);
      }, 100);
    }
  };

  const handleSave = async () => {
    if (!name || !location) {
      Alert.alert("Missing Info", "Please provide a name and select a location on the map.");
      return;
    }

    if (radius < 10) {
      Alert.alert("Invalid Radius", "Minimum geofence range is 10 meters.");
      return;
    }

    try {
      setIsSaving(true);
      await geofencesAPI.create({
        name,
        childId: childId || null,
        type,
        center: location,
        radius,
        color: type === "home" ? "#16a34a" : type === "school" ? "#d97706" : "#EA9E8D"
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save geofence.");
    } finally {
      setIsSaving(false);
    }
  };

  const initialRegion = useMemo(() => {
    const first = children.find(c => c.lastLocation?.lat);
    return {
      latitude: first?.lastLocation?.lat || 28.6139,
      longitude: first?.lastLocation?.lng || 77.2090
    };
  }, [children.length > 0]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.jet} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Safe Zone</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={COLORS.red} /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        keyboardShouldPersistTaps="handled"
        scrollEnabled={allowScroll}
      >
        {/* Map Picker */}
        <View 
          style={styles.mapContainer}
          onTouchStart={() => setAllowScroll(false)}
          onTouchEnd={() => setAllowScroll(true)}
          onTouchCancel={() => setAllowScroll(true)}
        >
          <FreeMap
            ref={mapRef}
            initialRegion={initialRegion}
            selectedLocation={location}
            geofences={location ? [{
              id: "temp",
              latitude: location.lat,
              longitude: location.lng,
              radius: radius,
              color: "#EA9E8D"
            }] : []}
            onMapPress={(coords) => setLocation(coords)}
          />
          <View style={styles.mapHint}>
            <Text style={styles.hintText}>Tap on map to set zone center</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Zone Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grandma's House"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Target Child</Text>
          <View style={styles.childList}>
            <TouchableOpacity 
              style={[styles.childChip, !childId && styles.childChipActive]} 
              onPress={() => setChildId("")}
            >
              <Text style={[styles.childText, !childId && styles.childTextActive]}>All Children</Text>
            </TouchableOpacity>
            {children.map(c => (
              <TouchableOpacity 
                key={c._id} 
                style={[styles.childChip, childId === c._id && styles.childChipActive]} 
                onPress={() => selectChild(c._id)}
              >
                <Text style={[styles.childText, childId === c._id && styles.childTextActive]}>{c.name.split(" ")[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Zone Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.typeBtn, type === t.id && styles.typeBtnActive]} 
                onPress={() => setType(t.id)}
              >
                <Ionicons name={t.icon as any} size={20} color={type === t.id ? "#fff" : COLORS.jet} />
                <Text style={[styles.typeText, type === t.id && styles.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Radius (meters)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={radius.toString()}
            onChangeText={(val) => {
              const num = parseInt(val) || 0;
              setRadius(num);
            }}
            onBlur={() => {
              if (radius < 10) setRadius(10);
            }}
            placeholder="e.g. 200 (Min 10m)"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  saveText: { fontSize: 16, fontWeight: "700", color: COLORS.red },
  scroll: { paddingBottom: 40 },
  mapContainer: { width: "100%", height: 300, backgroundColor: "#e5e7eb", position: "relative" },
  map: { width: "100%", height: "100%" },
  mapHint: { position: "absolute", bottom: 12, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  hintText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  form: { padding: 20 },
  label: { fontSize: 12, fontWeight: "800", color: COLORS.jet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: "600", color: COLORS.jet, elevation: 1 },
  childList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  childChip: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: `${COLORS.jet}10` },
  childChipActive: { backgroundColor: COLORS.jet, borderColor: COLORS.jet },
  childText: { fontSize: 13, fontWeight: "600", color: COLORS.jet },
  childTextActive: { color: "#fff" },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fff", paddingVertical: 12, borderRadius: 12, elevation: 1 },
  typeBtnActive: { backgroundColor: COLORS.jet },
  typeText: { fontSize: 13, fontWeight: "700", color: COLORS.jet },
  typeTextActive: { color: "#fff" },
});
