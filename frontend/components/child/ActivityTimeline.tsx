"use client";

import { useState, useEffect } from "react";
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
  battery_low: {
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
  },
};

function LocationAddress({ lat, lng }: { lat: number; lng: number }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;
    const cacheKey = `geo_v2_${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setAddress(cached);
      return;
    }

    const controller = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data?.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.street;
          const city = addr.city || addr.town || addr.village;
          const state = addr.state || addr.country;

          const parts = [];
          if (road) parts.push(road);
          if (city) parts.push(city);
          if (state) parts.push(state);

          const locName = parts.length > 0 ? `Near ${parts.join(", ")}` : data.display_name.split(",").slice(0, 3).join(", ");
          setAddress(locName);
          sessionStorage.setItem(cacheKey, locName);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [lat, lng]);

  return (
    <div className="flex flex-col gap-0.5 mt-2 bg-app-bg/50 p-2 rounded-lg border border-app-green/10">
      {address && (
        <span className="text-[11px] font-bold text-app-jet/80">
          📍 {address}
        </span>
      )}
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 text-app-jet/30" />
        <span className="text-[10px] text-app-jet/40 font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

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
      <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-app-green/30" />

      <div className="space-y-4">
        {activities.map((item, i) => {
          const cfg = activityConfig[item.type] || activityConfig.device_activity;
          const Icon = cfg.icon;
          
          // Extract coords if location is a string like "lat, lng"
          let coords = null;
          if (item.location && typeof item.location === 'string' && item.location.includes(',')) {
            const [lat, lng] = item.location.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              coords = { lat, lng };
            }
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 relative"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-app-green/30 bg-white relative z-10"
                )}
              >
                <Icon className={cn("w-5 h-5", cfg.color.split(" ")[1])} />
              </div>

              <div className="flex-1 bg-app-bg/40 rounded-xl p-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-app-jet">{item.title}</p>
                  <span className="text-[10px] text-app-jet/40 font-bold uppercase tracking-tighter whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-app-jet/60 mt-0.5">{item.description}</p>
                
                {coords ? (
                  <LocationAddress lat={coords.lat} lng={coords.lng} />
                ) : item.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-app-jet/30" />
                    <p className="text-[10px] text-app-jet/40 font-semibold">{item.location}</p>
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

