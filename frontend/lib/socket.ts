import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  const finalToken = token || getToken();
  
  // If we have an existing socket but the token has changed, disconnect and recreate
  if (socket) {
    const currentToken = socket.io.opts.auth?.token;
    if (finalToken && currentToken !== finalToken) {
      console.log("🔄 Token changed, reconnecting socket...");
      socket.disconnect();
      socket = null;
    }
  }

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: finalToken },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("safetrack_token");
};

export { socket };
