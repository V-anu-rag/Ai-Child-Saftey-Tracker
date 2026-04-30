"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Shield,
  AlertTriangle,
  Smartphone,
  Bell,
  Download,
  Search,
  RefreshCw,
} from "lucide-react";
import { locationAPI } from "@/lib/api";
import { useChildren } from "@/hooks/useChildren";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

const typeConfig: Record<string, any> = {
  location_update: { icon: MapPin, label: "Location", color: "text-blue-600 bg-blue-100" },
  location: { icon: MapPin, label: "Location", color: "text-blue-600 bg-blue-100" },
  geofence_enter: { icon: Shield, label: "Entered Zone", color: "text-green-700 bg-green-100" },
  geofence_exit: { icon: AlertTriangle, label: "Left Zone", color: "text-orange-600 bg-orange-100" },
  sos: { icon: AlertTriangle, label: "SOS", color: "text-red-700 bg-red-100" },
  sos_trigger: { icon: AlertTriangle, label: "SOS", color: "text-red-700 bg-red-100" },
  app_usage: { icon: Bell, label: "App Usage", color: "text-purple-600 bg-purple-100" },
  device_activity: { icon: Smartphone, label: "Device", color: "text-app-jet bg-app-jet/10" },
};

export default function HistoryPage() {
  const { children } = useChildren();
  const [selectedChild, setSelectedChild] = useState("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      // If "all", we might need to handle this differently. 
      // For now, let's fetch for the first child or empty if all
      const childId = selectedChild === "all" ? "all" : selectedChild;
      const res = await locationAPI.getHistory(childId) as any;
      setLogs(res.locations || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedChild, children]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.address?.toLowerCase().includes(q)) ||
      (log.childId?.name?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-app-jet">History</h2>
          <p className="text-sm text-app-jet/50 mt-1">Past activity logs and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHistory} leftIcon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />}>
            Refresh
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-app-green/40 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-app-jet/40 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location..."
            className="bg-transparent text-sm text-app-jet placeholder:text-app-jet/40 outline-none flex-1"
          />
        </div>
        <select 
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="bg-white border border-app-green/40 rounded-xl px-4 py-2 text-sm font-medium outline-none"
        >
          <option value="all">All Children</option>
          {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-white border border-app-green/40 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-app-bg/60 border-b border-app-green/30">
                {["Child", "Event", "Location", "Timestamp"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-app-jet/50 uppercase tracking-wider px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-green/20">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 animate-pulse text-app-jet/40">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <Calendar className="w-10 h-10 text-app-jet/20 mx-auto mb-2" />
                    <p className="text-sm text-app-jet/50">No records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => {
                  const cfg = typeConfig["location"] || typeConfig.location_update;
                  const Icon = cfg.icon;
                  return (
                    <motion.tr
                      key={log._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="hover:bg-app-bg/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-semibold text-app-jet">
                        {log.childId?.name || "Child"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold", cfg.color)}>
                          <Icon className="w-3.5 h-3.5" />
                          Location Update
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-app-jet/30" />
                          <span className="text-sm text-app-jet/60 truncate max-w-[250px]">
                            {log.address || `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-app-jet/50">{formatDate(log.createdAt)}</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
