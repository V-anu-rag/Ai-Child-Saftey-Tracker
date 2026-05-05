"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Child, GeofenceZone } from "@/types";

interface LocationMapProps {
  child: Child;
  geofences?: GeofenceZone[];
}

export function LocationMap({ child, geofences = [] }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const circles = useRef<any[]>([]);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // --- Load Leaflet ---
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement("link");
      link.id = 'leaflet-css';
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setIsLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsLeafletLoaded(true);
    }
  }, []);

  // --- Initialize Map ---
  useEffect(() => {
    if (!isLeafletLoaded || !mapRef.current || leafletMap.current) return;

    const L = (window as any).L;
    const initialPos = child.location?.lat ? [child.location.lat, child.location.lng] : [20.5937, 78.9629];
    
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialPos, 15);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(map);

    leafletMap.current = { map, L };
  }, [isLeafletLoaded, child.location]);

  // --- Update Marker & Geofences ---
  useEffect(() => {
    if (!leafletMap.current) return;
    const { map, L } = leafletMap.current;

    // Update Child Marker
    if (child.location?.lat && child.location?.lng) {
      const pos: [number, number] = [child.location.lat, child.location.lng];
      
      if (marker.current) {
        marker.current.setLatLng(pos);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #D64550; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.5);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        marker.current = L.marker(pos, { icon: customIcon }).addTo(map);
      }
      
      // Smoothly pan to new location
      map.panTo(pos, { animate: true, duration: 1 });
    }

    // Update Geofence Circles
    circles.current.forEach(c => c.remove());
    circles.current = [];

    geofences.forEach(zone => {
      if (zone.lat && zone.lng) {
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 10'
        }).addTo(map);
        circles.current.push(circle);
      }
    });

  }, [child.location, geofences]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-white border border-app-green/40 shadow-sm col-span-2 overflow-hidden"
    >
      <div className="p-5 border-b border-app-green/30 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-bold text-app-jet">Live Location</h3>
          <p className="text-xs text-app-jet/50 mt-0.5 truncate">{child.location?.address || "Waiting for GPS signal..."}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={child.isOnline ? "w-2 h-2 bg-green-500 rounded-full animate-pulse" : "w-2 h-2 bg-gray-400 rounded-full"} />
          <span className="text-xs text-app-jet/70 font-bold uppercase tracking-wider">
            {child.isOnline ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="relative h-72 bg-app-bg">
        <div ref={mapRef} className="w-full h-full z-0" />
        
        {!isLeafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-bg/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-app-salmon border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-app-jet/40 uppercase tracking-widest">Loading Map...</p>
            </div>
          </div>
        )}

        {!child.location && isLeafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <div className="text-center p-6">
              <MapPin className="w-8 h-8 text-app-jet/20 mx-auto mb-2" />
              <p className="text-sm font-semibold text-app-jet/60">No location data received</p>
              <p className="text-xs text-app-jet/40 mt-1">Waiting for the device to transmit coordinates...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="p-4 grid grid-cols-3 gap-4 bg-app-bg/20 border-t border-app-green/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Navigation className="w-3.5 h-3.5 text-app-jet/50" />
          </div>
          <p className="text-xs font-bold text-app-jet">{child.location?.lat?.toFixed(5) ?? "—"}</p>
          <p className="text-[10px] text-app-jet/40 uppercase tracking-tighter">Latitude</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Compass className="w-3.5 h-3.5 text-app-jet/50" />
          </div>
          <p className="text-xs font-bold text-app-jet">{child.location?.lng?.toFixed(5) ?? "—"}</p>
          <p className="text-[10px] text-app-jet/40 uppercase tracking-tighter">Longitude</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-app-red" />
          </div>
          <p className="text-xs font-bold text-app-jet capitalize">{child.safeStatus}</p>
          <p className="text-[10px] text-app-jet/40 uppercase tracking-tighter">Status</p>
        </div>
      </div>
    </motion.div>
  );
}
