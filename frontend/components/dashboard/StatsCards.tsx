"use client";

import { Users, AlertTriangle, MapPin, Wifi } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import type { Child } from "@/types";

interface StatsCardsProps {
  childrenData?: Child[];
  unreadAlerts?: number;
}

export function StatsCards({ childrenData = [], unreadAlerts = 0 }: StatsCardsProps) {
  const activeCount = childrenData.filter((c) => c.isOnline).length;
  const safeCount = childrenData.filter((c) => c.safeStatus === "safe").length;

  const stats = [
    {
      title: "Children Monitored",
      value: childrenData.length,
      icon: <Users className="w-6 h-6 text-app-jet" />,
      description: `${activeCount} currently active`,
      colorClass: "bg-app-green/70",
      delay: 0,
    },
    {
      title: "Unread Alerts",
      value: unreadAlerts,
      icon: <AlertTriangle className="w-6 h-6 text-app-red" />,
      description: "Requires your attention",
      colorClass: "bg-app-red/30",
      delay: 0.1,
    },
    {
      title: "Safe Status",
      value: childrenData.length > 0 ? `${safeCount}/${childrenData.length}` : "—",
      icon: <MapPin className="w-6 h-6 text-green-700" />,
      description: "Children in safe zones",
      colorClass: "bg-white",
      delay: 0.2,
    },
    {
      title: "Active Tracking",
      value: activeCount,
      icon: <Wifi className="w-6 h-6 text-blue-600" />,
      description: "Devices transmitting now",
      colorClass: "bg-white",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s) => (
        <StatCard key={s.title} {...s} />
      ))}
    </div>
  );
}
