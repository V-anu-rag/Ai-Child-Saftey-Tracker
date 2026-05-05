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
    // Default to collapsed on mobile
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }

    const handleApiRetry = () => {
      import("sonner").then(({ toast }) => {
        toast.error("Server is busy. Retrying...", {
          id: "api-retry",
          duration: 3000,
          description: "This might take a few seconds.",
        });
      });
    };

    window.addEventListener("api-retrying", handleApiRetry);
    return () => window.removeEventListener("api-retrying", handleApiRetry);
  }, []);

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
        <Topbar title={title} onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
