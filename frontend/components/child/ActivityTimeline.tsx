"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Shield,
  AlertTriangle,
  Smartphone,
  Activity,
  Bell,
} from "lucide-react";
import { ActivityItem } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const activityConfig = {
  location_update: {
    icon: MapPin,
    color: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
  },
  geofence_enter: {
    icon: Shield,
    color: "bg-green-100 text-green-700",
    border: "border-green-200",
  },
  geofence_exit: {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-600",
    border: "border-orange-200",
  },
  sos_trigger: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
    border: "border-red-200",
  },
  app_usage: {
    icon: Bell,
    color: "bg-purple-100 text-purple-600",
    border: "border-purple-200",
  },
  device_activity: {
    icon: Smartphone,
    color: "bg-app-jet/10 text-app-jet",
    border: "border-app-jet/20",
  },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Activity className="w-10 h-10 text-app-jet/20 mb-3" />
        <p className="font-semibold text-app-jet/60">No activity yet</p>
        <p className="text-sm text-app-jet/40 mt-1">Activity will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-app-green/40" />

      <div className="space-y-4">
        {activities.map((item, i) => {
          const cfg = activityConfig[item.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-4 relative"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border relative z-10 bg-white",
                  cfg.border
                )}
              >
                <Icon className={cn("w-5 h-5", cfg.color.split(" ")[1])} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-app-jet">{item.title}</p>
                  <span className="text-xs text-app-jet/40 whitespace-nowrap flex-shrink-0">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-app-jet/60 mt-0.5">{item.description}</p>
                {item.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-app-jet/30" />
                    <p className="text-xs text-app-jet/40">{item.location}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
