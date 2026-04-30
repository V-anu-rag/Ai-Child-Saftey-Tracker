"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Filter, RefreshCw } from "lucide-react";
import { AlertCard } from "@/components/alerts/AlertCard";
import { alertsAPI } from "@/lib/api";
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/SocketContext";

const filters = [
  { label: "All Alerts", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

export default function AlertsPage() {
  const { on, off, refreshUnreadCount } = useSocket();
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeFilter === "unread") params.unread = true;
      else if (activeFilter !== "all") params.severity = activeFilter;
      
      const res = await alertsAPI.getAll(params) as any;
      setAlerts(res.alerts || []);
      refreshUnreadCount(); // Sync sidebar badge
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, refreshUnreadCount]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Live alerts
  useEffect(() => {
    const handleNewAlert = (alert: any) => {
      setAlerts(prev => [alert, ...prev]);
    };
    on("alert-received", handleNewAlert);
    return () => off("alert-received", handleNewAlert);
  }, [on, off]);

  const handleDismiss = async (id: string) => {
    try {
      await alertsAPI.remove(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      refreshUnreadCount();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      refreshUnreadCount();
    } catch {}
  };
  const handleResolve = async (id: string) => {
    try {
      await alertsAPI.resolveSOS(id);
      setAlerts((prev) => {
        if (activeFilter === "unread") {
          return prev.filter((a) => a.id !== id && a._id !== id);
        }
        return prev.map((a) =>
          a.id === id || a._id === id ? { ...a, status: "resolved", isRead: true } : a
        );
      });
      refreshUnreadCount();
    } catch (err: any) {
      console.error("Failed to resolve SOS:", err);
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-app-jet">Alerts</h2>
          <p className="text-sm text-app-jet/50 mt-1">
            {unreadCount} unread · {alerts.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-app-red hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button onClick={fetchAlerts} className="flex items-center gap-2 text-sm text-app-jet/50 hover:text-app-jet">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeFilter === f.value
                ? "bg-app-jet text-white shadow-md"
                : "bg-white text-app-jet/60 border border-app-green/40 hover:bg-app-green/20"
            )}
          >
            {f.label}
            {f.value === "unread" && unreadCount > 0 && (
              <span className="ml-2 bg-app-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading && alerts.length === 0 ? (
            [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-bold text-app-jet">No alerts found</p>
              <p className="text-sm text-app-jet/50 mt-1">
                {activeFilter === "all"
                  ? "All clear — no alerts at the moment."
                  : `No ${activeFilter} alerts right now.`}
              </p>
            </motion.div>
          ) : (
            alerts.map((alert, i) => (
              <AlertCard
                key={alert.id || alert._id}
                alert={alert}
                delay={i * 0.04}
                onDismiss={handleDismiss}
                onResolve={handleResolve}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
