"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AlertCard } from "@/components/alerts/AlertCard";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";

const filters = [
  { label: "All Alerts", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

export default function AlertsPage() {
  const {
    alerts,
    loading,
    activeFilter,
    setActiveFilter,
    fetchAlerts,
    handleMarkAsRead,
    handleResolve,
    handleDismiss,
    handleMarkAllRead
  } = useAlerts("all");

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all",
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
            [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />)
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
                key={alert.id}
                alert={alert}
                delay={i * 0.04}
                onDismiss={handleDismiss}
                onResolve={handleResolve}
                onMarkRead={handleMarkAsRead}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
