import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { Alert, Vibration } from "react-native";
import { useAuth } from "./AuthContext";
import { SOSAlertModal } from "../components/SOSAlertModal";

// Detect computer's IP for Socket.io
const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
const SOCKET_URL = debuggerHost
  ? `http://${debuggerHost}:5000`
  : "http://localhost:5000";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler?: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, logout } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOS, setActiveSOS] = useState<any>(null);

  useEffect(() => {
    // 🔒 Prevent early execution
    if (!isAuthenticated || !token || !SOCKET_URL) {
      return;
    }

    // 🔒 Prevent multiple connections
    if (socketRef.current) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
    });

    // 🚨 SAFE ALERT HANDLING
    socket.on("alert-received", (data: any) => {
      console.log("🚨 Alert Received:", data);

      setTimeout(() => {
        try {
          Vibration.vibrate([0, 500, 200, 500]);

          if (data.type === "sos" || data.alertType === "sos") {
            setActiveSOS(data);
          } else {
            Alert.alert(
              "🚨 ALERT RECEIVED",
              `${data.childName || "A child"}: ${data.message}`,
              [{ text: "OK", style: "default" }]
            );
          }
        } catch (e) {
          console.warn("Alert handling error:", e);
        }
      }, 0);
    });

    // 🚫 SAFE UNPAIR HANDLING
    socket.on("child-unpaired", (data: any) => {
      console.log("🚫 Child Unpaired:", data);

      setTimeout(() => {
        try {
          Alert.alert(
            "🚫 Device Unpaired",
            data.message ||
              "Your device has been unpaired by your parent.",
            [{ text: "OK", onPress: () => logout() }]
          );
        } catch (e) {
          console.warn("Unpair alert error:", e);
        }
      }, 0);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  const emit = (event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
  };

  const off = (event: string, handler?: (...args: unknown[]) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
      }}
    >
      {children}

      {/* ✅ SAFE MODAL RENDER */}
      {activeSOS && (
        <SOSAlertModal
          isVisible={true}
          alertData={activeSOS}
          onClose={() => setActiveSOS(null)}
        />
      )}
    </SocketContext.Provider>
  );
};

// 🔒 SAFE HOOK
export const useSocket = () => {
  const ctx = useContext(SocketContext);

  if (!ctx) {
    return {
      socket: null,
      isConnected: false,
      emit: () => {},
      on: () => {},
      off: () => {},
    };
  }

  return ctx;
};