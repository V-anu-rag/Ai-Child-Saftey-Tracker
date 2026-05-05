"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  colorClass?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  colorClass = "bg-white",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "rounded-2xl p-5 border border-app-green shadow-sm hover:shadow-md hover:border-app-red/30 transition-all cursor-default",
        colorClass
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-app-jet/40 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-app-jet mt-1 font-display">{value}</p>
          {description && (
            <p className="text-xs text-app-jet/50 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-emerald-600" : "text-red-500"
                )}
              >
                {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-app-jet/40">vs last week</span>
            </div>
          )}
        </div>
        <div className="ml-4 p-2.5 rounded-xl bg-app-red/8 flex-shrink-0">{icon}</div>
      </div>
    </motion.div>
  );
}
