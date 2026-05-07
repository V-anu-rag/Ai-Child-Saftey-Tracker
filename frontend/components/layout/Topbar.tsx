"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu, BellOff } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

interface TopbarProps {
  title?: string;
  onToggleSidebar?: () => void;
}
export function Topbar({ title = "Dashboard", onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { alerts, unreadCount, loading, markAsRead } = useNotifications();
  const [tick, setTick] = useState(0);

  // Auto-update timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-app-green flex items-center justify-between px-6 flex-shrink-0 relative z-10">
      {/* Left: Title + Search */}
      <div className="flex items-center gap-4 sm:gap-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-app-bg text-app-jet transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-app-jet">{title}</h1>
        <div className="hidden md:flex items-center gap-2 bg-app-bg rounded-xl px-3 py-2 border border-app-green w-64">
          <Search className="w-4 h-4 text-app-jet/40" />
          <input
            type="text"
            placeholder="Search children, alerts..."
            className="bg-transparent text-sm text-app-jet placeholder:text-app-jet/40 outline-none flex-1"
          />
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative w-9 h-9 rounded-xl bg-app-bg border border-app-green flex items-center justify-center hover:border-app-red/30 transition-colors"
          >
            <Bell className="w-4 h-4 text-app-jet/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-app-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed md:absolute right-4 md:right-0 top-16 md:top-full mt-2 w-[calc(100vw-32px)] md:w-80 bg-white rounded-2xl shadow-2xl border border-app-green overflow-hidden z-50"
              >
                <div className="p-4 border-b border-app-green">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-app-jet">Notifications</h3>
                    <span className="text-xs text-app-red font-medium">{unreadCount} new</span>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {loading && alerts.length === 0 ? (
                    <div className="px-4 py-6 space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-app-jet/10 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-app-jet/10 rounded w-3/4" />
                            <div className="h-3 bg-app-jet/10 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-app-green/10 flex items-center justify-center mb-3">
                        <BellOff className="w-6 h-6 text-app-green" />
                      </div>
                      <p className="text-sm font-medium text-app-jet">You&apos;re all caught up!</p>
                      <p className="text-xs text-app-jet/50 mt-1">No unread notifications</p>
                    </div>
                  ) : (
                    alerts.slice(0, 10).map((alert) => (
                      <button
                        key={alert.id || alert._id}
                        onClick={() => markAsRead(alert.id || alert._id)}
                        className={cn(
                          "w-full text-left px-4 py-3 border-b border-app-bg/50 hover:bg-app-bg/50 transition-colors",
                          !alert.isRead && "bg-app-red/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                              alert.severity === "critical" ? "bg-app-red" :
                              alert.severity === "high" ? "bg-orange-500" :
                              alert.severity === "medium" ? "bg-yellow-500" : "bg-green-500"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-app-jet truncate">{alert.title}</p>
                            {/* We use `tick` implicitly in the component to trigger re-renders, formatRelativeTime recalculates */}
                            <p className="text-xs text-app-jet/50 mt-0.5">{alert.childName} · {formatRelativeTime(alert.timestamp)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3">
                  <Link
                    href="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center text-sm text-app-red font-medium hover:underline"
                  >
                    View all alerts →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-app-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-app-jet flex items-center justify-center text-white text-[10px] font-bold border border-white/20">
              {user ? getInitials(user.name) : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-app-jet leading-none">
                {user?.name || "Parent User"}
              </p>
              <p className="text-[11px] text-app-jet/50 mt-0.5 capitalize">{user?.role || "Parent"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-app-jet/50 hidden md:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-app-green overflow-hidden py-1"
              >
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-jet/70 hover:text-app-jet hover:bg-app-bg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-jet/70 hover:text-app-jet hover:bg-app-bg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-app-red hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop */}
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setNotifOpen(false);
            setProfileOpen(false);
          }}
        />
      )}
    </header>
  );
}
