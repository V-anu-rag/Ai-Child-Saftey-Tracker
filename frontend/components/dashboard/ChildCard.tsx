"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Wifi, WifiOff, MapPin, ChevronRight, Trash2, RefreshCw, Copy, Check } from "lucide-react";
import { Child } from "@/types";
import { childrenAPI } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";

interface ChildCardProps {
  child: Child;
  delay?: number;
}

const statusConfig = {
  safe: {
    label: "Safe",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  warning: {
    label: "Warning",
    dot: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  alert: {
    label: "Alert",
    dot: "bg-app-red animate-pulse",
    badge: "bg-app-red/10 text-app-red border-app-red/20",
  },
};

export function ChildCard({ child, delay = 0 }: ChildCardProps) {
  const status = statusConfig[child.safeStatus];
  const childId = child.id || (child as any)._id;
  const [newCode, setNewCode] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasLocation = !!child.lastLocation?.address;
  const isWaitingForPairing = !!((child as any).pairingCode || !(child as any).userId);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to remove ${child.name}?`)) {
      try {
        await childrenAPI.remove(childId);
        window.location.reload();
      } catch (err) {
        alert("Failed to remove child profile.");
      }
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRegenerating(true);
    try {
      const res = await childrenAPI.regenerateCode(childId) as any;
      setNewCode(res.pairingCode);
    } catch (err) {
      alert("Failed to generate new pairing code.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newCode) {
      navigator.clipboard.writeText(newCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -3 }}
    >
      <Link
        href={`/children/${childId}`}
        className="block rounded-2xl bg-white border border-app-green/40 p-5 shadow-sm hover:shadow-lg transition-shadow group relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-app-bg overflow-hidden border-2 border-app-green/40 flex items-center justify-center">
                {child.avatar ? (
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xl font-black text-app-jet/40 uppercase">
                    {child.name.charAt(0)}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
                  child.isOnline ? "bg-green-500" : "bg-gray-400"
                )}
              />
            </div>
            <div>
              <p className="font-bold text-app-jet text-sm uppercase">{child.name}</p>
              <p className="text-xs text-app-jet/50">Age {child.age} · {child.grade}</p>
            </div>
          </div>

          {/* Status + Delete */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                status.badge
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-app-red/5 text-app-red hover:bg-app-red/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Child"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-4 bg-app-bg/60 rounded-xl p-3">
          <MapPin className="w-3.5 h-3.5 text-app-jet/40 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {hasLocation ? (
              <p className="text-xs text-app-jet/70 leading-snug">
                {child.lastLocation!.address}
              </p>
            ) : isWaitingForPairing ? (
              <p className="text-xs text-app-jet/70 leading-snug">
                Waiting for device pairing...
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xs text-app-jet/70 leading-snug font-medium italic">
                  Paired! Waiting for GPS...
                </p>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-app-red"></span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Regenerate Pairing Code — shown when child is offline */}
        {!child.isOnline && (
          <AnimatePresence>
            {newCode ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onClick={(e) => e.preventDefault()}
                className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3"
              >
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">New Pairing Code</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-app-jet tracking-[0.15em] font-mono">{newCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-2 w-full mb-4 py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRegenerating && "animate-spin")} />
                {isRegenerating ? "Generating..." : "Regenerate Pairing Code"}
              </button>
            )}
          </AnimatePresence>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Battery */}
            <div className="flex items-center gap-1">
              <Battery
                className={cn(
                  "w-3.5 h-3.5",
                  child.batteryLevel < 25 ? "text-app-red" : "text-app-jet/50"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  child.batteryLevel < 25 ? "text-app-red" : "text-app-jet/60"
                )}
              >
                {child.batteryLevel}%
              </span>
            </div>

            {/* Connectivity */}
            <div className="flex items-center gap-1">
              {child.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-xs text-app-jet/50">
                {child.isOnline ? "Online" : formatRelativeTime(child.lastSeen)}
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-app-jet/30 group-hover:text-app-red group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}
