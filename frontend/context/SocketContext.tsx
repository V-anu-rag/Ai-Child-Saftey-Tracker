"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { alertsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Alert } from "@/types";

// Global throttle to prevent 429 loops across remounts
let GLOBAL_LAST_SYNC = 0;
let GLOBAL_HAS_LOADED_ONCE = false;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  alerts: Alert[];
  unreadCount: number;
  latestAlert: Alert | null;
  clearLatestAlert: () => void;
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  markAllRead: () => void;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  forceSync: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, user } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const isSyncing = useRef(false);
  const hasLoadedOnce = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);

  const forceSync = useCallback(
    async (bypassCooldown = false) => {
      if (!isAuthenticated || isSyncing.current) return;

      const now = Date.now();
      // Strict 30s cooldown even across remounts
      if (!bypassCooldown && now - GLOBAL_LAST_SYNC < 30_000) {
        console.log("⏳ [SYNC] Skipping sync (cooldown active)");
        return;
      }

      isSyncing.current = true;
      GLOBAL_LAST_SYNC = now;

      try {
        console.log("🔄 [SOCKET] Syncing alerts from API...");
        const res = (await alertsAPI.getAll({ limit: 50 })) as any;
        const normalized: Alert[] = (res.alerts || []).map((a: any) => ({
          ...a,
          id: (a._id || a.id)?.toString(),
        }));

        setAlerts(normalized);
        setUnreadCount(res.unreadCount ?? 0);

        const activeSOS = normalized.find(
          (a: Alert) => a.type === "sos" && a.status !== "resolved",
        );
        if (activeSOS) {
          console.log("🚨 [SOCKET] Active SOS found in sync:", activeSOS.id);
          setLatestAlert(activeSOS);
        }
      } catch (err: any) {
        console.error("❌ [SYNC] Failed:", err?.message);
      } finally {
        isSyncing.current = false;
      }
    },
    [isAuthenticated],
  );

  const clearLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
        setSocketInstance(null);
      }
      setIsConnected(false);
      setAlerts([]);
      setUnreadCount(0);
      setLatestAlert(null);
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;
    setSocketInstance(socket);

    const onConnect = () => {
      console.log("🟢 [SOCKET] Connected:", socket.id);
      setIsConnected(true);
      socket.emit("join-parent-room");

      if (!GLOBAL_HAS_LOADED_ONCE) {
        GLOBAL_HAS_LOADED_ONCE = true;
        forceSync(true); // First load sync
      }
    };

    const onDisconnect = (reason: string) => {
      console.warn("🔴 [SOCKET] Disconnected:", reason);
      setIsConnected(false);
    };

    const onRoomJoined = (data: any) => {
      console.log("🏠 [SOCKET] Room Joined:", data.room);
    };

    const showBrowserNotification = (title: string, body: string, data: any = {}) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;

      const trigger = async () => {
        const isSOS = data.type === "sos";
        const options: any = {
          body,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: isSOS ? "sos-alert" : "safetrack-alert",
          renotify: true,
          vibrate: isSOS ? [200, 100, 200, 100, 200, 100, 400] : [100],
          requireInteraction: isSOS, // Keeps SOS alerts on screen until clicked
          data: { ...data, url: window.location.origin + "/alerts" },
          actions: [
            { action: "view", title: "📍 View Map" },
            { action: "resolve", title: "✅ Resolve" },
          ],
        };

        // Try to use Service Worker for rich notifications (actions, vibrate, etc.)
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, options);
        } else {
          // Fallback to basic notification
          new Notification(title, options);
        }
      };

      if (Notification.permission === "granted") {
        trigger();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") trigger();
        });
      }
    };

    const onAlertReceived = (raw: any) => {
      console.log("🚨 [SOCKET] Alert Recv:", raw.type, "Status:", raw.status);
      const normalized = { ...raw, id: (raw._id || raw.id)?.toString() };

      setAlerts((prev) => {
        if (prev.some((a) => a.id === normalized.id)) return prev;
        return [normalized, ...prev];
      });

      if (!normalized.isRead) setUnreadCount((c) => c + 1);

      // Only show modal for ACTIVE SOS
      if (normalized.type === "sos" && normalized.status !== "resolved") {
        setLatestAlert(normalized);
        toast.error(`🚨 SOS: ${normalized.childName || "Child"}`, {
          duration: Infinity,
          description: normalized.message,
        });
      } else {
        toast.info(normalized.title, { description: normalized.message });
      }

      // Trigger native browser notification
      showBrowserNotification(
        normalized.title || "Safety Alert", 
        normalized.message,
        normalized
      );
    };

    const onAlertResolved = (data: any) => {
      const alertId = data.alertId?.toString();
      console.log("✅ [SOCKET] Resolved:", alertId);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "resolved", isRead: true } : a,
        ),
      );
      setLatestAlert((prev: any) => (prev?.id === alertId ? null : prev));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room-joined", onRoomJoined);
    socket.on("alert-received", onAlertReceived);
    socket.on("alert-resolved", onAlertResolved);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room-joined", onRoomJoined);
      socket.off("alert-received", onAlertReceived);
      socket.off("alert-resolved", onAlertResolved);
    };
  }, [isAuthenticated, token, forceSync]);

  // Actions
  const markAlertRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    alertsAPI.markRead(id).catch(() => {});
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "resolved", isRead: true } : a,
      ),
    );
    setLatestAlert((prev: any) => (prev?.id === id ? null : prev));
    alertsAPI.resolveSOS(id).catch(() => {});
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setLatestAlert((prev: any) => (prev?.id === id ? null : prev));
    alertsAPI.remove(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setUnreadCount(0);
    alertsAPI.markAllRead().catch(() => {});
  }, []);

  const on = useCallback(
    (e: string, h: any) => socketInstance?.on(e, h),
    [socketInstance],
  );
  const off = useCallback(
    (e: string, h?: any) => socketInstance?.off(e, h),
    [socketInstance],
  );
  const emit = useCallback(
    (e: string, d?: any) => socketInstance?.emit(e, d),
    [socketInstance],
  );

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        isConnected,
        emit,
        on,
        off,
        alerts,
        unreadCount,
        latestAlert,
        clearLatestAlert,
        markAlertRead,
        resolveAlert,
        dismissAlert,
        markAllRead,
        refreshUnreadCount: () => forceSync(true),
        setUnreadCount,
        forceSync: () => forceSync(true),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
