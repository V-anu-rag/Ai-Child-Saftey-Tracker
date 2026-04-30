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

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  latestAlert: any | null;
  clearLatestAlert: () => void;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = (await alertsAPI.getAll({ limit: 1 })) as any;
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onAlert = (alert: any) => {
      console.log("🚨 Global SOS Received:", alert);
      setLatestAlert(alert);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("alert-received", onAlert);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("alert-received", onAlert);
    };
  }, [isAuthenticated, token]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      if (handler) socketRef.current?.off(event, handler);
      else socketRef.current?.off(event);
    },
    [],
  );

  const clearLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
        latestAlert,
        clearLatestAlert,
        unreadCount,
        refreshUnreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
