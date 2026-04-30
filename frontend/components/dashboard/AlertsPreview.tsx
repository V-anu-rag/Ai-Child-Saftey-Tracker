"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Battery, Smartphone, Bell, ChevronRight } from "lucide-react";
import { Alert } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

interface AlertsPreviewProps {
  alerts: Alert[];
  maxItems?: number;
}

const alertIconMap = {
  location: MapPin,
  geofence: MapPin,
  sos: AlertTriangle,
  battery: Battery,
  device: Smartphone,
  app_usage: Bell,
};

const severityStyles = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const dotColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500 animate-pulse",
};

export function AlertsPreview({ alerts, maxItems = 5 }: AlertsPreviewProps) {
  const shown = alerts.slice(0, maxItems);

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-semibold text-app-jet">All Clear!</p>
        <p className="text-sm text-app-jet/50 mt-1">No alerts right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shown.map((alert, i) => {
        const Icon = alertIconMap[alert.type] || Bell;
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl border transition-colors hover:bg-app-bg/50 cursor-pointer",
              !alert.isRead ? "bg-app-green/20 border-app-green/40" : "bg-transparent border-transparent hover:border-app-green/20"
            )}
          >
            <div className={cn("p-2 rounded-xl flex-shrink-0 border", severityStyles[alert.severity])}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-app-jet truncate">{alert.title}</p>
                {!alert.isRead && (
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColors[alert.severity])} />
                )}
              </div>
              <p className="text-xs text-app-jet/50 truncate">{alert.childName} · {formatRelativeTime(alert.timestamp)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-app-jet/30 flex-shrink-0" />
          </motion.div>
        );
      })}

      <Link
        href="/alerts"
        className="block text-center text-sm font-medium text-app-red hover:underline pt-2"
      >
        View all {alerts.length} alerts →
      </Link>
    </div>
  );
}
