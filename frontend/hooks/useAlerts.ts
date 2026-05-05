import { useState, useEffect, useCallback } from "react";
import { alertsAPI } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { Alert } from "@/types";

export const normalizeAlert = (alert: any): Alert => ({
  ...alert,
  id: alert._id || alert.id,
});

export function useAlerts(initialFilter: string = "all") {
  const { on, off, refreshUnreadCount } = useSocket();
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeFilter === "unread") params.unread = true;
      else if (activeFilter !== "all") params.severity = activeFilter;
      
      const res = await alertsAPI.getAll(params) as any;
      const normalizedAlerts = (res.alerts || []).map(normalizeAlert);
      setAlerts(normalizedAlerts);
      refreshUnreadCount();
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, refreshUnreadCount]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time socket sync with filter awareness
  useEffect(() => {
    const handleNewAlert = (rawAlert: any) => {
      const alert = normalizeAlert(rawAlert);
      
      setAlerts(prev => {
        // Prevent duplicates
        if (prev.some(a => a.id === alert.id)) return prev;

        // Apply active filter logic
        if (activeFilter === "unread" && alert.isRead) return prev;
        if (activeFilter !== "all" && activeFilter !== "unread" && alert.severity !== activeFilter) return prev;

        return [alert, ...prev];
      });
      
      // Global unread count is already handled by SocketContext natively, 
      // but we can refresh it to ensure complete sync
      refreshUnreadCount();
    };

    on("alert-received", handleNewAlert);
    return () => off("alert-received", handleNewAlert);
  }, [on, off, activeFilter, refreshUnreadCount]);

  // Optimistic Handlers
  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI
    setAlerts(prev => {
      if (activeFilter === "unread") {
        return prev.filter(a => a.id !== id);
      }
      return prev.map(a => a.id === id ? { ...a, isRead: true } : a);
    });
    
    try {
      await alertsAPI.markRead(id);
      refreshUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read", err);
      fetchAlerts(); // Rollback
    }
  };

  const handleResolve = async (id: string) => {
    // Optimistic UI
    setAlerts(prev => {
      if (activeFilter === "unread") {
        return prev.filter(a => a.id !== id);
      }
      return prev.map(a => a.id === id ? { ...a, status: "resolved", isRead: true } : a);
    });

    try {
      await alertsAPI.resolveSOS(id);
      refreshUnreadCount();
    } catch (err) {
      console.error("Failed to resolve", err);
      fetchAlerts(); // Rollback
    }
  };

  const handleDismiss = async (id: string) => {
    // Optimistic UI
    setAlerts(prev => prev.filter(a => a.id !== id));

    try {
      await alertsAPI.remove(id);
      refreshUnreadCount();
    } catch (err) {
      console.error("Failed to dismiss", err);
      fetchAlerts(); // Rollback
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI
    setAlerts(prev => {
      if (activeFilter === "unread") return [];
      return prev.map(a => ({ ...a, isRead: true }));
    });

    try {
      await alertsAPI.markAllRead();
      refreshUnreadCount();
    } catch (err) {
      console.error("Failed to mark all read", err);
      fetchAlerts(); // Rollback
    }
  };

  return {
    alerts,
    loading,
    activeFilter,
    setActiveFilter,
    fetchAlerts,
    handleMarkAsRead,
    handleResolve,
    handleDismiss,
    handleMarkAllRead
  };
}
