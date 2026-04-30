import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Switch, Alert, ActivityIndicator, RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { geofencesAPI, childrenAPI } from "../../api/client";

const COLORS = {
  bg: "#EEF4D4", green: "#DAEFB3", red: "#D64550",
  salmon: "#EA9E8D", jet: "#1C2826",
};

export default function GeofencingScreen({ navigation }: any) {
  const [geofences, setGeofences] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [geoRes, childRes] = await Promise.all([
        geofencesAPI.getAll() as any,
        childrenAPI.getAll() as any
      ]);
      setGeofences(geoRes.geofences || []);
      setChildren(childRes.children || []);
    } catch (err) {
      console.error("Geofencing fetch error:", err);
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

  const handleToggle = async (id: string) => {
    try {
      await geofencesAPI.toggle(id);
      setGeofences(prev => prev.map(z => z._id === id ? { ...z, isActive: !z.isActive } : z));
    } catch (err) {
      Alert.alert("Error", "Failed to toggle geofence.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Zone?", "Are you sure you want to remove this geofence?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await geofencesAPI.remove(id);
            setGeofences(prev => prev.filter(z => z._id !== id));
          } catch (err) {
            Alert.alert("Error", "Failed to delete geofence.");
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const child = children.find(c => c._id === item.childId);
    const typeIcon = item.type === "home" ? "home" : item.type === "school" ? "school" : "shield";
    
    return (
      <View style={[styles.card, !item.isActive && styles.cardInactive]}>
        <View style={[styles.iconBox, { backgroundColor: item.color || COLORS.salmon }]}>
          <Ionicons name={typeIcon as any} size={22} color="#fff" />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.zoneName}>{item.name}</Text>
          <Text style={styles.childName}>{child?.name || "General Zone"}</Text>
          <Text style={styles.radiusText}>{item.radius}m Radius</Text>
        </View>

        <View style={styles.cardActions}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggle(item._id)}
            trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
            thumbColor={item.isActive ? "#16a34a" : "#9ca3af"}
          />
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.jet} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geofencing</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddGeofence")} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={geofences}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="map-outline" size={60} color={`${COLORS.jet}20`} />
              <Text style={styles.emptyText}>No safe zones found</Text>
              <Text style={styles.emptySub}>Add zones like Home or School to get notified when your child arrives.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.red, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, alignItems: "center", gap: 12, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  cardInactive: { opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1 },
  zoneName: { fontSize: 15, fontWeight: "700", color: COLORS.jet },
  childName: { fontSize: 12, color: `${COLORS.jet}60`, marginTop: 2 },
  radiusText: { fontSize: 11, fontWeight: "600", color: COLORS.salmon, marginTop: 4, textTransform: "uppercase" },
  cardActions: { alignItems: "flex-end", gap: 8 },
  deleteBtn: { padding: 4 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: "800", color: COLORS.jet, marginTop: 16 },
  emptySub: { fontSize: 13, color: `${COLORS.jet}60`, textAlign: "center", marginTop: 8, lineHeight: 20 },
});
