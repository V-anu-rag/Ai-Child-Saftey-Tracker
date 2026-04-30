"use client";

import { motion } from "framer-motion";
import { Battery, Wifi, WifiOff, School, Phone, MapPin, Calendar } from "lucide-react";
import { Child } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

interface ChildProfileProps {
  child: Child;
}

export function ChildProfile({ child }: ChildProfileProps) {
  const statusMap = {
    safe: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    alert: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white border border-app-green/40 p-6 shadow-sm"
    >
      {/* Avatar + Name */}
      <div className="flex items-start gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-app-bg overflow-hidden border-2 border-app-green/40 flex items-center justify-center">
            {child.avatar ? (
              <img
                src={child.avatar}
                alt={child.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black text-app-jet/40 uppercase">
                {child.name.charAt(0)}
              </span>
            )}
          </div>
          <span
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
              child.isOnline ? "bg-green-500" : "bg-gray-400"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-app-jet">{child.name}</h2>
              <p className="text-sm text-app-jet/50">Age {child.age} · {child.grade}</p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold border",
                statusMap[child.safeStatus]
              )}
            >
              {child.safeStatus.charAt(0).toUpperCase() + child.safeStatus.slice(1)}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Battery
                className={cn(
                  "w-4 h-4",
                  child.batteryLevel < 25 ? "text-app-red" : "text-app-jet/50"
                )}
              />
              <span className={cn("text-sm", child.batteryLevel < 25 ? "text-app-red font-semibold" : "text-app-jet/60")}>
                {child.batteryLevel}% battery
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {child.isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-app-jet/60">
                {child.isOnline ? "Online now" : `Last seen ${formatRelativeTime(child.lastSeen)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-app-jet/50" />
              <span className="text-sm text-app-jet/60">{child.deviceName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-app-green/30 my-5" />

      {/* Info grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-app-bg rounded-xl p-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <School className="w-4 h-4 text-app-jet" />
          </div>
          <div>
            <p className="text-xs text-app-jet/50">School</p>
            <p className="text-sm font-semibold text-app-jet">{child.school}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-app-bg rounded-xl p-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 text-app-red" />
          </div>
          <div>
            <p className="text-xs text-app-jet/50">Current Location</p>
            <p className="text-sm font-semibold text-app-jet line-clamp-1">{child.location.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-app-bg rounded-xl p-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <Calendar className="w-4 h-4 text-app-jet" />
          </div>
          <div>
            <p className="text-xs text-app-jet/50">Last Update</p>
            <p className="text-sm font-semibold text-app-jet">{formatRelativeTime(child.location.timestamp)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <Button size="sm" className="flex-1">📍 Track Now</Button>
        <Button size="sm" variant="secondary" className="flex-1">📞 Contact</Button>
        <Button size="sm" variant="danger">🚨 SOS</Button>
      </div>
    </motion.div>
  );
}
