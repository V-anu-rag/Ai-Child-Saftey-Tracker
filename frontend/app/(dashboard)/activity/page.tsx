"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  MapPin,
  Shield,
  AlertTriangle,
  Smartphone,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { activityAPI, geofencesAPI, locationAPI } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/activity/LiveMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-app-jet/20 font-bold uppercase tracking-widest text-xs">Loading Map...</div>
});

const activityIcons: Record<string, any> = {
  location_update: { icon: MapPin, color: "bg-blue-100 text-blue-600" },
  location: { icon: MapPin, color: "bg-blue-100 text-blue-600" },
  geofence_enter: { icon: Shield, color: "bg-green-100 text-green-700" },
  geofence_exit: { icon: AlertTriangle, color: "bg-orange-100 text-orange-600" },
  sos: { icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  sos_trigger: { icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  app_usage: { icon: Bell, color: "bg-purple-100 text-purple-600" },
  alert: { icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  device_activity: { icon: Smartphone, color: "bg-app-jet/10 text-app-jet" },
};

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs text-green-700 font-semibold">Live</span>
    </span>
  );
}

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
          const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district;
          const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.municipality;
          const state = addr.state || addr.country;

          const parts = [];
          if (road) parts.push(road);
          
          if (neighborhood && !parts.includes(neighborhood)) {
            parts.push(neighborhood);
          }
          if (city && !parts.includes(city)) {
            parts.push(city);
          }
          if (state && !parts.includes(state)) {
            parts.push(state);
          }

          const locName = parts.length > 0 
            ? `Near ${parts.join(", ")}` 
            : data.display_name.split(",").slice(0, 3).join(", ");
            
          setAddress(locName);
          sessionStorage.setItem(cacheKey, locName);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [lat, lng]);

  return (
    <div className="flex flex-col gap-0.5 mt-1.5 bg-app-bg/50 p-2 rounded-lg border border-app-green/10">
      {address && (
        <span className="text-xs font-semibold text-app-jet/80">
          📍 {address}
        </span>
      )}
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 text-app-jet/40" />
        <span className="text-[10px] text-app-jet/50 font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const { children, isLoading: childrenLoading } = useChildren();
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [activities, setActivities] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState(6);
  const [loading, setLoading] = useState(true);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const childId = selectedChild === "all" ? "all" : selectedChild;
      const res = await activityAPI.get(childId) as any;
      setActivities(res.timeline || []);
      setDisplayLimit(6);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const res = await geofencesAPI.getAll() as any;
        setGeofences(res.geofences || []);
      } catch (err) {
        console.error("Failed to fetch geofences:", err);
      }
    };
    fetchGeofences();
  }, []);

  useEffect(() => {
    if (selectedChild === "all") {
      setHistory([]);
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await locationAPI.getHistory(selectedChild, { limit: 20 }) as any;
        setHistory(res.locations || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, [selectedChild]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-app-jet">Live Activity</h2>
          <p className="text-sm text-app-jet/50 mt-1">Real-time feed of all events</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveDot />
          <Button 
            size="sm" 
            variant="outline" 
            leftIcon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />}
            onClick={fetchActivities}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Child filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedChild("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
            selectedChild === "all"
              ? "bg-app-jet text-white"
              : "bg-white text-app-jet/60 border border-app-green/40 hover:bg-app-green/20"
          )}
        >
          All Children
        </button>
        {children.map((child) => (
          <button
            key={child._id || child.id}
            onClick={() => setSelectedChild((child._id || child.id)!)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
              selectedChild === (child._id || child.id)
                ? "bg-app-jet text-white"
                : "bg-white text-app-jet/60 border border-app-green/40 hover:bg-app-green/20"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                child.isOnline ? "bg-green-500" : "bg-gray-400"
              )}
            />
            {child.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map View */}
        <div className="lg:col-span-3">
          <SectionWrapper title="Location" noPadding>
            <div className="h-[400px] lg:h-[450px] w-full">
              <LiveMap 
                childrenData={children as any[]} 
                selectedChildId={selectedChild} 
                geofences={geofences}
                history={history}
              />
            </div>
          </SectionWrapper>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <SectionWrapper title="Activity Feed" noPadding>
            <div className="p-6">
              {loading && activities.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Activity className="w-12 h-12 text-app-jet/20 mb-3" />
                  <p className="font-semibold text-app-jet/60">No activity</p>
                  <p className="text-sm text-app-jet/40 mt-1">Select a different child or wait for pings</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-app-green/30" />
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {activities.slice(0, displayLimit).map((item, i) => {
                        const typeKey = item.type === "alert" ? item.alertType || "alert" : item.type;
                        const cfg = activityIcons[typeKey] || { icon: Activity, color: "bg-gray-100 text-gray-600" };
                        const Icon = cfg.icon;
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
                            <div className="flex-1 bg-app-bg/50 rounded-xl p-3 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-app-jet">{item.title}</p>
                                <span className="text-xs text-app-jet/40 whitespace-nowrap">
                                  {formatRelativeTime(item.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-app-jet/60 mt-0.5">{item.message || item.description}</p>
                              {(item.coords || item.location) && (
                                <LocationAddress 
                                  lat={item.coords?.lat || item.location?.lat} 
                                  lng={item.coords?.lng || item.location?.lng} 
                                />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  {displayLimit < activities.length && (
                    <div className="mt-6 flex justify-center pb-2 relative z-20">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDisplayLimit(prev => prev + 6)}
                        className="bg-white hover:bg-app-bg"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
