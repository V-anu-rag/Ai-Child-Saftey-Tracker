"use client";

import { useEffect, useRef, useState } from "react";

interface Geofence {
  _id?: string;
  id?: string;
  name: string;
  center?: {
    lat: number;
    lng: number;
  };
  lat?: number;
  lng?: number;
  radius: number;
  childId?: string;
}

interface ChildData {
  _id?: string;
  id?: string;
  name: string;
  lastLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isOnline: boolean;
}

interface HistoryPoint {
  lat: number;
  lng: number;
  createdAt: string;
}

export default function LiveMap({ 
  childrenData, 
  selectedChildId,
  geofences = [],
  history = [],
  onMapClick,
  previewPoint
}: { 
  childrenData: ChildData[]; 
  selectedChildId: string;
  geofences?: Geofence[];
  history?: HistoryPoint[];
  onMapClick?: (lat: number, lng: number) => void;
  previewPoint?: { lat: number, lng: number, radius: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const geofenceCircles = useRef<Record<string, any>>({});
  const previewCircle = useRef<any>(null);
  const historyPolyline = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

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
      script.onload = () => {
        setIsLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setIsLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLeafletLoaded || !mapRef.current) return;
    
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      map.on('click', (e: any) => {
        if (onMapClickRef.current) onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      });

      leafletMap.current = { map, L };
    }

    const { map } = leafletMap.current;
    const currentMarkers = markers.current;
    const currentCircles = geofenceCircles.current;

    // --- RENDER CHILDREN MARKERS ---
    const displayChildren = selectedChildId === "all" 
      ? childrenData 
      : childrenData.filter(c => (c._id || c.id) === selectedChildId);

    Object.keys(currentMarkers).forEach(id => {
      if (!displayChildren.find(c => (c._id || c.id) === id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

    displayChildren.forEach(child => {
      const loc = child.location || child.lastLocation;
      const childId = child._id || child.id;
      if (loc?.lat && loc?.lng && childId) {
        const pos: [number, number] = [loc.lat, loc.lng];
        if (currentMarkers[childId]) {
          currentMarkers[childId].setLatLng(pos);
        } else {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #D64550; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.5); position: relative;">
                     <div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: white; color: #1C2826; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #eee;">
                       ${child.name}
                     </div>
                   </div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          currentMarkers[childId] = L.marker(pos, { icon: customIcon }).addTo(map);
        }
      }
    });

    // --- RENDER GEOFENCES ---
    const displayGeofences = selectedChildId === "all"
      ? geofences
      : geofences.filter(g => g.childId === selectedChildId);

    Object.keys(currentCircles).forEach(id => {
      if (!displayGeofences.find(g => (g._id || g.id) === id)) {
        currentCircles[id].remove();
        delete currentCircles[id];
      }
    });

    displayGeofences.forEach(zone => {
      const lat = zone.center?.lat ?? zone.lat;
      const lng = zone.center?.lng ?? zone.lng;
      const radius = zone.radius;
      const zoneId = zone._id || zone.id;

      if (typeof lat === 'number' && typeof lng === 'number' && zoneId) {
        if (currentCircles[zoneId]) {
          currentCircles[zoneId].setLatLng([lat, lng]);
          currentCircles[zoneId].setRadius(radius);
        } else {
          currentCircles[zoneId] = L.circle([lat, lng], {
            radius: radius,
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10'
          }).addTo(map);
        }
      }
    });

    // --- PREVIEW CIRCLE ---
    if (previewCircle.current) {
      previewCircle.current.remove();
      previewCircle.current = null;
    }
    if (previewPoint && typeof previewPoint.lat === 'number' && typeof previewPoint.lng === 'number') {
      previewCircle.current = L.circle([previewPoint.lat, previewPoint.lng], {
        radius: previewPoint.radius,
        color: '#D64550',
        fillColor: '#D64550',
        fillOpacity: 0.2,
        weight: 3,
        dashArray: 'none'
      }).addTo(map);
    }

    // --- RENDER HISTORY POLYLINE ---
    if (historyPolyline.current) {
      historyPolyline.current.remove();
      historyPolyline.current = null;
    }
    if (selectedChildId !== "all" && Array.isArray(history)) {
      const pathCoords = history
        .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number')
        .map(p => [p.lat, p.lng] as [number, number]);
        
      if (pathCoords.length > 1) {
        historyPolyline.current = L.polyline(pathCoords, {
          color: '#8B5CF6',
          weight: 3,
          opacity: 0.6,
          dashArray: '8, 8'
        }).addTo(map);
      }
    }

    // --- AUTO-FOCUS ---
    const allItems: any[] = [
      ...Object.values(currentMarkers),
      ...Object.values(currentCircles)
    ];
    if (previewCircle.current) allItems.push(previewCircle.current);

    if (allItems.length > 0) {
      const group = L.featureGroup(allItems);
      if (previewPoint) {
         // Keep current view while placing
      } else if (selectedChildId !== "all" && currentMarkers[selectedChildId]) {
        map.setView(currentMarkers[selectedChildId].getLatLng(), 15, { animate: true });
      } else {
        try {
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.3));
          }
        } catch (e) {
          console.warn("Could not fit bounds:", e);
        }
      }
    }
  }, [isLeafletLoaded, childrenData, selectedChildId, geofences, history, previewPoint]);

  return (
    <div className="w-full h-full relative group">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-app-green/20"
        style={{ background: "#f8fafc" }}
      />
      {!isLeafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[2px] z-[500]">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-app-salmon border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-bold text-app-jet/40 uppercase tracking-widest">Initialising Tracking...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-app-green/20 shadow-sm pointer-events-none">
          <p className="text-[10px] font-bold text-app-jet/40 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Tracking
          </p>
        </div>
      </div>
    </div>
  );
}
