"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Child } from "@/types";

interface LocationMapProps {
  child: Child;
}

export function LocationMap({ child }: LocationMapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-white border border-app-green/40 shadow-sm col-span-2 overflow-hidden"
    >
      <div className="p-5 border-b border-app-green/30 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-app-jet">Live Location</h3>
          <p className="text-xs text-app-jet/50 mt-0.5">{child.location?.address || "No location yet"}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-700 font-medium">Live</span>
        </div>
      </div>

      {/* Mock Map */}
      <div className="relative h-64 bg-gradient-to-br from-[#d9e8b3] to-[#c5dba0] overflow-hidden">
        {/* Grid lines simulating map */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Road lines */}
        <div className="absolute top-1/2 left-0 right-0 h-6 bg-white/50 -translate-y-1/2" />
        <div className="absolute left-1/3 top-0 bottom-0 w-5 bg-white/40" />

        {/* Geofence circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border-2 border-app-red/40 bg-app-red/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-app-red/30 bg-app-red/5" />
          </div>
        </div>

        {/* Child pin */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-app-red border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="w-2 h-2 bg-app-red rounded-full shadow-md mt-0.5" />
          </div>
          {/* Name tag */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-app-jet text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
            {child.name.split(" ")[0]}
          </div>
        </motion.div>

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 text-[10px] text-app-jet/30 bg-white/60 rounded px-1">
          Mock Map View
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="p-4 grid grid-cols-3 gap-4 bg-app-bg/40">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Navigation className="w-3.5 h-3.5 text-app-jet/50" />
          </div>
          <p className="text-xs font-bold text-app-jet">{child.location?.lat?.toFixed(4) ?? "—"}</p>
          <p className="text-[10px] text-app-jet/40">Latitude</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Compass className="w-3.5 h-3.5 text-app-jet/50" />
          </div>
          <p className="text-xs font-bold text-app-jet">{child.location?.lng?.toFixed(4) ?? "—"}</p>
          <p className="text-[10px] text-app-jet/40">Longitude</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-app-red" />
          </div>
          <p className="text-xs font-bold text-app-jet">Safe Zone</p>
          <p className="text-[10px] text-app-jet/40">Inside</p>
        </div>
      </div>
    </motion.div>
  );
}
