"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { alertsAPI } from "@/lib/api";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { AlertsPreview } from "@/components/dashboard/AlertsPreview";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { PairingModal } from "@/components/dashboard/PairingModal";
import { Button } from "@/components/common/Button";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";
import type { Alert } from "@/types";
import Link from "next/link";
import { comingSoon } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { children, isLoading: childrenLoading, error: childrenError, refresh } = useChildren();
  const { isConnected, on, off, refreshUnreadCount } = useSocket();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.getAll({ limit: 5 }) as any;
      setAlerts(res.alerts || []);
      setUnreadCount(res.unreadCount || 0);
    } catch { /* silent */ } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Live alert updates
  useEffect(() => {
    const handleAlert = (alert: any) => {
      setAlerts((prev) => [{ ...alert, isRead: false }, ...prev].slice(0, 5));
      setUnreadCount((n) => n + 1);
    };
    on("alert-received", handleAlert);
    return () => off("alert-received", handleAlert);
  }, [on, off]);

  const [isPairingOpen, setIsPairingOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefresh = useRef<number>(0);

  const handleRefresh = async () => {
    const now = Date.now();
    // Throttle: max 1 refresh every 5 seconds
    if (now - lastRefresh.current < 5000) {
      import("sonner").then(({ toast }) => {
        toast("Please wait a moment before refreshing again.", { id: "throttle" });
      });
      return;
    }
    
    lastRefresh.current = now;
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), fetchAlerts(), refreshUnreadCount()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-5">
      <PairingModal isOpen={isPairingOpen} onClose={() => setIsPairingOpen(false)} />
      
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4 rounded-2xl bg-white border border-app-green p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-app-jet font-display">
              {greeting()}, {user?.name?.split(" ")[0] || "Parent"} 👋
            </h2>
            {/* Live indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? "Live" : "Offline"}
            </div>
          </div>
          <p className="text-sm text-app-jet/50 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<RefreshCw className="w-4 h-4" />} 
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsPairingOpen(true)}>
            Add Child
          </Button>
        </div>
      </div>

      {/* Error state */}
      {childrenError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium"
        >
          ⚠️ {childrenError} —{" "}
          <button onClick={handleRefresh} className="underline hover:no-underline">Retry</button>
        </motion.div>
      )}

      {/* Stats — pass real data */}
      <StatsCards childrenData={children} unreadAlerts={unreadCount} />

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Children */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-app-jet text-lg">Your Children</h3>
            <button onClick={comingSoon} className="text-sm text-app-red hover:underline font-medium">Manage →</button>
          </div>

          {childrenLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : children.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-app-green p-12 text-center">
              <p className="font-semibold text-app-jet/60">No children added yet</p>
              <p className="text-sm text-app-jet/40 mt-1">Add your first child to start tracking</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {children.map((child, i) => (
                <ChildCard key={child.id} child={child} delay={i * 0.1} />
              ))}
              {/* Add child placeholder */}
              <div 
                onClick={() => setIsPairingOpen(true)}
                className="rounded-2xl border-2 border-dashed border-app-red/50 p-5 flex flex-col items-center justify-center gap-2 text-center hover:border-app-red/40 hover:bg-app-red/5 transition-all cursor-pointer min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-xl bg-app-red/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-app-jet/60" />
                </div>
                <p className="text-sm font-semibold text-app-jet/60">Add Another Child</p>
                <p className="text-xs text-app-jet/40">Pair a new device</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="sm:mt-11">
          <SectionWrapper
            title="Recent Alerts"
            description={`${unreadCount} unread`}
            noPadding
            action={
              <Link href="/alerts" className="text-xs text-app-red hover:underline font-medium">See all</Link>
            }
          >
            <div className="px-6 pb-6">
              {alertsLoading ? (
                <div className="space-y-2 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
                  ))}
                </div>
              ) : (
                <AlertsPreview alerts={alerts} maxItems={5} />
              )}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
