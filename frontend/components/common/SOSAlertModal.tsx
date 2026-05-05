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
      // Play high-priority alert sound
      const audio = new Audio("/sos-siren.mp3"); // Ensure this asset exists in public
      audio.loop = true;
      audio.play().catch(() => console.log("Audio play failed (user interaction required)"));
      
      // Stop after 30 seconds to prevent annoyance if not dismissed
      const timer = setTimeout(() => {
        audio.pause();
      }, 30000);

      return () => {
        audio.pause();
        clearTimeout(timer);
      };
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-app-jet/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-red-500"
        >
          {/* Header */}
          <div className="bg-red-500 p-4 flex flex-col items-center text-white text-center relative overflow-hidden">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 relative z-10"
            >
              <AlertTriangle className="w-9 h-9 text-white" />
            </motion.div>
            <h2 className="text-xl font-black uppercase tracking-tighter relative z-10">Emergency SOS</h2>
            <p className="text-xs text-white/80 font-bold relative z-10">Immediate help requested</p>
            
            {/* Background animated circles */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-app-bg rounded-xl flex items-center justify-center font-bold text-sm text-app-jet">
                {latestAlert.childName?.charAt(0) || "!"}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-app-jet">
                  {latestAlert.childName}
                </h3>
                <p className="text-xs text-app-jet/60">
                  {formatRelativeTime(latestAlert.timestamp)}
                </p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
              <p className="text-red-900 text-sm font-medium text-center">
                {latestAlert.message}
              </p>
            </div>

            {latestAlert.location && (
              <div className="flex items-start gap-2 p-3 bg-app-bg rounded-xl mb-5">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-app-jet/40 uppercase mb-1">
                    Location
                  </p>
                  <p className="text-xs text-app-jet font-medium">
                    {latestAlert.location.address ||
                      `${latestAlert.location.lat.toFixed(4)}, ${latestAlert.location.lng.toFixed(4)}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link
                href={`/activity?childId=${latestAlert.childId}`}
                onClick={() => {
                  setIsVisible(false);
                  clearLatestAlert();
                }}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                View Map
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="py-3 bg-app-jet text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isResolving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Resolve
                </button>

                <button
                  onClick={() => {
                    setIsVisible(false);
                    clearLatestAlert();
                  }}
                  className="py-3 rounded-xl font-semibold text-sm text-app-jet/60 hover:bg-app-bg"
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
