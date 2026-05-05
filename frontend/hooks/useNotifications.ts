"use client";

import { useState, useEffect, useCallback } from "react";
import { alertsAPI } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const { on, off, unreadCount, setUnreadCount, refreshUnreadCount } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await alertsAPI.getAll({ unread: true, limit: 10 }) as any;
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time socket sync
  useEffect(() => {
    const handleNewAlert = (alert: any) => {
      // Add to top of the list, ensuring it's uniquely formatted
      const newAlert = { ...alert, id: alert._id || alert.id };
      setAlerts(prev => {
        // Prevent duplicates in case of reconnects
        if (prev.some(a => (a._id || a.id) === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });
      // Note: unreadCount is already incremented globally in SocketContext's own listener
    };

    on("alert-received", handleNewAlert);
    return () => {
      off("alert-received", handleNewAlert);
    };
  }, [on, off]);

  // Optimistic Mark as Read
  const markAsRead = async (id: string) => {
    // 1. Optimistic UI update
    setAlerts(prev => prev.filter(a => (a._id || a.id) !== id));
    setUnreadCount(Math.max(0, unreadCount - 1));

    // 2. Background API request
    try {
      await alertsAPI.markRead(id);
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
      // Rollback on error by re-fetching the correct state
      refreshUnreadCount();
      fetchAlerts();
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchAlerts
  };
}
