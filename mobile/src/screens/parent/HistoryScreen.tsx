import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { childrenAPI, locationAPI } from "../../api/client";

const COLORS = {
  bg: "#EEF4D4",
  green: "#DAEFB3",
  red: "#D64550",
  salmon: "#EA9E8D",
  jet: "#1C2826",
};

const typeColors: Record<string, string> = {
  location_update: "#2563eb",
  geofence_enter: "#16a34a",
  geofence_exit: "#ea580c",
  sos_trigger: "#dc2626",
  app_usage: "#7c3aed",
  device_activity: "#374151",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_LARGE_SCREEN = SCREEN_WIDTH > 400;

export default function HistoryScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    childrenAPI.getAll().then((res: any) => {
      const kids = res.children || [];
      setChildren(kids);
      if (kids.length) setSelectedChild(kids[0]._id);
    });
  }, []);

  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!selectedChild) return;
      const nextPage = reset ? 1 : page;

      try {
        const res = (await locationAPI.getHistory(selectedChild, {
          page: nextPage,
          limit: 30,
        })) as any;

        const locs = res.locations || [];

        setHistory(reset ? locs : (prev) => [...prev, ...locs]);
        setTotalPages(res.totalPages || 1);

        if (!reset) setPage(nextPage + 1);
        else setPage(2);
      } catch (err) {
        console.log("History fetch error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedChild, page]
  );

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      setPage(1);
      fetchHistory(true);
    }
  }, [selectedChild]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(true);
  };

  const loadMore = () => {
    if (page <= totalPages) fetchHistory();
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.histItem}>
      <View
        style={[
          styles.typeDot,
          { backgroundColor: typeColors[item.type] || "#6b7280" },
        ]}
      />

      <View style={styles.histContent}>
        <Text style={styles.histTitle}>
          {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
        </Text>

        <View style={styles.histMeta}>
          <Ionicons name="time-outline" size={11} color={`${COLORS.jet}50`} />
          <Text style={styles.histTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>

          {item.accuracy && (
            <Text style={styles.histAccuracy}>
              ±{Math.round(item.accuracy)}m
            </Text>
          )}
        </View>
      </View>

      {item.batteryLevel !== null && item.batteryLevel !== undefined && (
        <View style={styles.battery}>
          <Ionicons
            name="battery-half"
            size={13}
            color={item.batteryLevel < 20 ? COLORS.red : `${COLORS.jet}60`}
          />
          <Text
            style={[
              styles.batteryText,
              item.batteryLevel < 20 && { color: COLORS.red },
            ]}
          >
            {item.batteryLevel}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Location History</Text>

      {/* CHILD SELECTOR */}
      <FlatList
        data={children}
        horizontal
        keyExtractor={(c) => c._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.childRow}
        renderItem={({ item }) => {
          const displayName =
            item?.name?.trim()?.length > 0
              ? item.name.split(" ")[0]
              : "Child";

          return (
            <TouchableOpacity
              style={[
                styles.childChip,
                selectedChild === item._id && styles.chipActive,
              ]}
              onPress={() => setSelectedChild(item._id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedChild === item._id && styles.chipTextActive,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* LOADER */}
      {loading ? (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="small"
          color={COLORS.red}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.red}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="map-outline"
                size={40}
                color={`${COLORS.jet}30`}
              />
              <Text style={styles.emptyText}>No history yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.jet,
    padding: 20,
    paddingBottom: 12,
  },

  childRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: IS_LARGE_SCREEN ? 12 : 8,
  },

  childChip: {
  paddingHorizontal: 18,
  height: 44,                // ✅ FIX: fixed height
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
},

chipText: {
  fontSize: 16,
  fontWeight: "600",
  lineHeight: 18,            // ✅ VERY IMPORTANT
  textAlign: "center",
},
  chipActive: {
    backgroundColor: COLORS.jet,
    borderColor: COLORS.jet,
    elevation: 4,
  },

  chipTextActive: { color: "#fff" },

  histItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },

  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },

  histContent: { flex: 1 },

  histTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.jet,
    fontFamily: "monospace",
  },

  histMeta: { flexDirection: "row", alignItems: "center", gap: 4 },

  histTime: { fontSize: 11, color: `${COLORS.jet}55` },

  histAccuracy: { fontSize: 11, color: `${COLORS.jet}40`, marginLeft: 4 },

  battery: { flexDirection: "row", alignItems: "center", gap: 3 },

  batteryText: { fontSize: 11, color: `${COLORS.jet}60` },

  separator: { height: 8 },

  empty: { alignItems: "center", paddingTop: 60, gap: 8 },

  emptyText: {
    fontSize: 14,
    color: `${COLORS.jet}50`,
    fontWeight: "600",
  },
});