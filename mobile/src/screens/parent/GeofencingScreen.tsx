import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Switch, Alert, ActivityIndicator, RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { childrenAPI } from "../../api/client";
import { COLORS } from "../../constants/theme";
import { useGeofences } from "../../context/GeofenceContext";

export default function GeofencingScreen({ navigation }: any) {
  const { geofences, fetchGeofences, removeGeofence, toggleGeofence, isLoading: contextLoading } = useGeofences();
  const [children, setChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const childRes = await childrenAPI.getAll() as any;
      setChildren(childRes.children || []);
    } catch (err) {
      console.error("Geofencing fetch error:", err);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchGeofences(), fetchChildren()]);
    setRefreshing(false);
  }, [fetchGeofences, fetchChildren]);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
      fetchGeofences();
    }, [fetchChildren, fetchGeofences])
  );

  const handleToggle = async (id: string) => {
    try {
      await toggleGeofence(id);
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
            await removeGeofence(id);
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
        <View style={[styles.iconBox, { backgroundColor: item.color || COLORS.primary }]}>
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
            trackColor={{ false: COLORS.green, true: `${COLORS.salmon}50` }}
            thumbColor={item.isActive ? COLORS.salmon : "#9ca3af"}
          />
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          !(contextLoading || loadingChildren) ? (
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
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.green },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, alignItems: "center", gap: 12, elevation: 2, shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 10 },
  cardInactive: { opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1 },
  zoneName: { fontSize: 15, fontWeight: "700", color: COLORS.jet },
  childName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  radiusText: { fontSize: 11, fontWeight: "800", color: COLORS.salmon, marginTop: 4, textTransform: "uppercase" },
  cardActions: { alignItems: "flex-end", gap: 8 },
  deleteBtn: { padding: 4 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: "800", color: COLORS.jet, marginTop: 16 },
  emptySub: { fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginTop: 8, lineHeight: 20 },
});
