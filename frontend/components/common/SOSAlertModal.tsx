"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, X, Bell } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { alertsAPI } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function SOSAlertModal() {
  const { latestAlert, clearLatestAlert, refreshUnreadCount } = useSocket();
  const [isVisible, setIsVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (latestAlert && latestAlert.type === "sos") {
      setIsVisible(true);
      // Play sound
      const audio = new Audio("/sos_alert.mp3");
      audio.play().catch(() => console.log("Audio play failed"));
    }
  }, [latestAlert]);

  const handleResolve = async () => {
    if (!latestAlert?._id) return;
    setIsResolving(true);
    try {
      await alertsAPI.resolveSOS(latestAlert._id);
      console.log("Emergency SOS resolved");
      setIsVisible(false);
      clearLatestAlert();
      refreshUnreadCount();
    } catch (err: any) {
      console.error(err.message || "Failed to resolve SOS");
      alert(err.message || "Failed to resolve SOS");
    } finally {
      setIsResolving(false);
    }
  };

  if (!latestAlert || !isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-app-jet/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-500"
        >
          <div className="bg-red-500 p-6 flex flex-col items-center text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Emergency SOS</h2>
            <p className="text-white/80 font-medium">Immediate help requested</p>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-app-bg rounded-2xl flex items-center justify-center font-bold text-xl text-app-jet">
                {latestAlert.childName?.charAt(0) || "!"}
              </div>
              <div>
                <h3 className="font-bold text-app-jet">{latestAlert.childName}</h3>
                <p className="text-sm text-app-jet/60">{formatRelativeTime(latestAlert.timestamp)}</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
              <p className="text-red-900 font-medium text-center">
                {latestAlert.message}
              </p>
            </div>

            {latestAlert.location && (
              <div className="flex items-start gap-3 p-4 bg-app-bg rounded-2xl mb-8">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-app-jet/40 uppercase mb-1">Last Known Location</p>
                  <p className="text-sm text-app-jet font-medium">
                    {latestAlert.location.address || `${latestAlert.location.lat.toFixed(4)}, ${latestAlert.location.lng.toFixed(4)}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={`/activity?childId=${latestAlert.childId}`}
                onClick={() => {
                  setIsVisible(false);
                  clearLatestAlert();
                }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 text-center flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                View Live Map
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="py-4 bg-app-jet text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isResolving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Resolve
                </button>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    clearLatestAlert();
                  }}
                  className="py-4 rounded-2xl font-bold text-app-jet/60 hover:bg-app-bg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
