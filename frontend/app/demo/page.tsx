"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Shield, LayoutDashboard, Activity, 
  Bell, History, MapPin, Settings, LogOut, Search, Menu, 
  ChevronLeft, ChevronRight
} from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { AlertsPreview } from "@/components/dashboard/AlertsPreview";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { mockChildren, mockAlerts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DemoDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  
  const unreadCount = mockAlerts.filter(a => !a.isRead).length;

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1 z-[100] text-center shadow-md">
        Demo Mode — Interactive Preview Only
      </div>

      {/* Mock Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        className="hidden md:flex flex-col h-screen bg-app-jet text-white flex-shrink-0 z-50 pt-6"
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 mb-6">
          <div className="w-9 h-9 rounded-xl bg-app-red flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="ml-3 text-lg font-bold">Safe<span className="text-app-red">Track</span></span>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Activity, label: "Activity" },
            { icon: Bell, label: "Alerts", badge: unreadCount },
            { icon: History, label: "History" },
            { icon: MapPin, label: "Geofencing" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer",
                item.active ? "bg-app-red text-white shadow-lg" : "text-white/60 hover:bg-white/10"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-app-salmon text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-xs font-bold uppercase tracking-wider">Exit Demo</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-4">
        {/* Mock Topbar */}
        <header className="h-16 bg-white border-b border-app-green flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 -ml-2 rounded-xl hover:bg-app-bg text-app-jet transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            <h1 className="text-lg font-bold text-app-jet">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 bg-app-bg border border-app-green rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-app-jet/40" />
              <input type="text" placeholder="Search..." className="bg-transparent text-xs outline-none w-48" />
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-app-jet flex items-center justify-center text-white text-[10px] font-bold border border-white/20">
                JD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-app-jet leading-none">Jane Doe</p>
                <p className="text-[10px] text-app-jet/50 mt-1 uppercase">Parent Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Welcome */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-app-green rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-extrabold text-app-jet">Good afternoon, Jane 👋</h2>
              <p className="text-sm text-app-jet/50 mt-1">Here is a real-time overview of your children's safety.</p>
            </div>
            <div className="flex gap-3">
               <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  LIVE DEMO
               </div>
            </div>
          </div>

          {/* Stats */}
          <StatsCards childrenData={mockChildren} unreadAlerts={unreadCount} />

          {/* Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-app-jet text-lg">Your Children</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockChildren.map((child, i) => (
                  <ChildCard key={child.id} child={child} delay={i * 0.1} />
                ))}
                <div className="rounded-2xl border-2 border-dashed border-app-red/20 p-6 flex flex-col items-center justify-center gap-2 text-center opacity-40 cursor-not-allowed min-h-[160px]">
                  <div className="w-10 h-10 rounded-xl bg-app-jet/5 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-app-jet/40" />
                  </div>
                  <p className="text-xs font-bold text-app-jet/60 uppercase">Add Child</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <SectionWrapper title="Recent Alerts" noPadding>
                  <div className="p-6">
                    <AlertsPreview alerts={mockAlerts} maxItems={5} />
                  </div>
               </SectionWrapper>
            </div>
          </div>
        </main>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-8 left-8 w-10 h-10 bg-app-jet text-white rounded-full hidden md:flex items-center justify-center shadow-2xl z-[100] border border-white/10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}
