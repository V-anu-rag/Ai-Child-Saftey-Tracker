"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/common/LoadingSkeleton";
import { SOSAlertModal } from "@/components/common/SOSAlertModal";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/activity": "Live Activity",
  "/alerts": "Alerts",
  "/history": "History",
  "/geofencing": "Geofencing",
  "/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // or a login prompt
  }

  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Dashboard";

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      <SOSAlertModal />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
