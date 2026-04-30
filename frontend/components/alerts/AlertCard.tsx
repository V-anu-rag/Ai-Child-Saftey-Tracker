"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Battery,
  Smartphone,
  Bell,
  X,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Alert } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  delay?: number;
  onDismiss?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const iconMap = {
  location: MapPin,
  geofence: MapPin,
  sos: AlertTriangle,
  battery: Battery,
  device: Smartphone,
  app_usage: Bell,
};

const severityConfig = {
  low: {
    icon: "bg-green-100 text-green-700 border-green-200",
    badge: "bg-green-100 text-green-700 border-green-200",
    bar: "bg-green-500",
    label: "Low",
  },
  medium: {
    icon: "bg-yellow-100 text-yellow-700 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    bar: "bg-yellow-500",
    label: "Medium",
  },
  high: {
    icon: "bg-orange-100 text-orange-700 border-orange-200",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    bar: "bg-orange-500",
    label: "High",
  },
  critical: {
    icon: "bg-red-100 text-red-700 border-red-200",
    badge: "bg-app-red/10 text-app-red border-app-red/20",
    bar: "bg-app-red",
    label: "Critical",
  },
};

export function AlertCard({ alert, delay = 0, onDismiss, onResolve }: AlertCardProps) {
  const Icon = iconMap[alert.type] || Bell;
  const cfg = severityConfig[alert.severity];
  const isResolved = alert.status === "resolved";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "relative rounded-2xl bg-white border p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group",
        !alert.isRead ? "border-app-green/50" : "border-app-green/20",
        isResolved && "opacity-60 bg-gray-50"
      )}
    >
      {/* Severity left bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", isResolved ? "bg-gray-300" : cfg.bar)} />

      <div className="flex items-start gap-4 pl-2">
        {/* Icon */}
        <div className={cn("p-2.5 rounded-xl flex-shrink-0 border", cfg.icon)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-app-jet">{alert.title}</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", cfg.badge)}>
                  {cfg.label}
                </span>
                {!alert.isRead && (
                  <span className="text-xs bg-app-red/10 text-app-red px-2 py-0.5 rounded-full border border-app-red/20 font-medium">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-app-jet/60 mt-0.5">{alert.message || alert.description}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {alert.type === "sos" && !isResolved && onResolve && (
                <button
                  onClick={() => onResolve(alert.id || alert._id || "")}
                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                  title="Mark as Resolved"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id || alert._id || "")}
                  className="p-1 rounded-lg hover:bg-app-bg text-app-jet/40 hover:text-app-jet flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-2 text-xs text-app-jet/40">
            <span className="font-medium text-app-jet/60">{alert.childName}</span>
            {alert.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {alert.location?.address || "Unknown location"}
              </span>
            )}
            <span>{formatRelativeTime(alert.timestamp)}</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-app-jet/30 flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}
