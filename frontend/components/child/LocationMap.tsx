"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Child, GeofenceZone } from "@/types";

interface LocationMapProps {
  child: Child;
  geofences?: GeofenceZone[];
}

// Precise mathematical GeoJSON polygon generator for geofences (radius in meters)
function getGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const [lng, lat] = center;
  const km = radiusInMeters / 1000;
  const coords = [];
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  coords.push(coords[0]); // Close polygon loop

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [coords],
    },
  };
}

export function LocationMap({ child, geofences = [] }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const maplibreMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const [isMapCNLoaded, setIsMapCNLoaded] = useState(false);

  // --- Load MapLibre GL ---
  useEffect(() => {
    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@4.3.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    if (!(window as any).maplibregl) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@4.3.0/dist/maplibre-gl.js";
      script.async = true;
      script.onload = () => setIsMapCNLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsMapCNLoaded(true);
    }
  }, []);

  // --- Initialize Map ---
  useEffect(() => {
    if (!isMapCNLoaded || !mapRef.current || maplibreMap.current) return;

    const maplibregl = (window as any).maplibregl;
    const initialPos = child.location?.lat 
      ? [child.location.lng, child.location.lat] 
      : [78.9629, 20.5937]; // Lng, Lat for MapLibre
    
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: initialPos,
      zoom: 15,
      attributionControl: false
    });

    maplibreMap.current = { map, maplibregl };

    return () => {
      if (map) {
        map.remove();
        maplibreMap.current = null;
      }
    };
  }, [isMapCNLoaded, child.id]);

  // --- Update Marker & Geofences ---
  useEffect(() => {
    if (!maplibreMap.current) return;
    const { map, maplibregl } = maplibreMap.current;

    // Update Child Marker
    if (child.location?.lat && child.location?.lng) {
      const pos: [number, number] = [child.location.lng, child.location.lat];
      
      if (marker.current) {
        marker.current.setLngLat(pos);
      } else {
        const el = document.createElement("div");
        el.className = "custom-div-icon";
        el.innerHTML = `<div style="background-color: #D64550; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.5);"></div>`;
        
        marker.current = new maplibregl.Marker({ element: el })
          .setLngLat(pos)
          .addTo(map);
      }
      
      // Smoothly pan to new location
      map.easeTo({ center: pos, duration: 1000 });
    }

    // Function to apply geofence updates safely
    const applyGeofences = () => {
      if (map.getLayer("geofence-fill")) map.removeLayer("geofence-fill");
      if (map.getLayer("geofence-stroke")) map.removeLayer("geofence-stroke");
      if (map.getSource("geofences")) map.removeSource("geofences");

      const features = geofences
        .filter(zone => zone.lat && zone.lng)
        .map(zone => getGeoJSONCircle([zone.lng, zone.lat], zone.radius));

      map.addSource("geofences", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features
        }
      });

      map.addLayer({
        id: "geofence-fill",
        type: "fill",
        source: "geofences",
        paint: {
          "fill-color": "#3B82F6",
          "fill-opacity": 0.1
        }
      });

      map.addLayer({
        id: "geofence-stroke",
        type: "line",
        source: "geofences",
        paint: {
          "line-color": "#3B82F6",
          "line-width": 2,
          "line-dasharray": [2, 2]
        }
      });
    };

    if (map.isStyleLoaded()) {
      applyGeofences();
    } else {
      map.once("style.load", applyGeofences);
    }

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
        
        {!isMapCNLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-bg/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-app-salmon border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-app-jet/40 uppercase tracking-widest">Loading Map...</p>
            </div>
          </div>
        )}

        {!child.location && isMapCNLoaded && (
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
