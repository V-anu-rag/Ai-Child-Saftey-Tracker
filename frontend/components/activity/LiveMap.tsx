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
  const maplibreMap = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const [isMapCNLoaded, setIsMapCNLoaded] = useState(false);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

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
      script.onload = () => {
        setIsMapCNLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setIsMapCNLoaded(true);
    }
  }, []);

  // --- Initialize Map ---
  useEffect(() => {
    if (!isMapCNLoaded || !mapRef.current) return;
    
    const maplibregl = (window as any).maplibregl;
    if (!maplibregl) return;

    if (!maplibreMap.current) {
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [78.9629, 20.5937],
        zoom: 5,
        attributionControl: false
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "bottom-right");

      map.on("click", (e: any) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.lngLat.lat, e.lngLat.lng);
        }
      });

      maplibreMap.current = { map, maplibregl };
    }

    const { map } = maplibreMap.current;

    const renderMapElements = () => {
      // --- RENDER CHILDREN MARKERS ---
      const displayChildren = selectedChildId === "all" 
        ? childrenData 
        : childrenData.filter(c => (c._id || c.id) === selectedChildId);

      // Remove removed markers
      Object.keys(markers.current).forEach(id => {
        if (!displayChildren.find(c => (c._id || c.id) === id)) {
          markers.current[id].remove();
          delete markers.current[id];
        }
      });

      // Update / Create markers
      displayChildren.forEach(child => {
        const loc = child.location || child.lastLocation;
        const childId = child._id || child.id;
        if (loc?.lat && loc?.lng && childId) {
          const pos: [number, number] = [loc.lng, loc.lat];
          if (markers.current[childId]) {
            markers.current[childId].setLngLat(pos);
          } else {
            const el = document.createElement("div");
            el.className = "custom-div-icon";
            el.innerHTML = `<div style="background-color: #D64550; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.5); position: relative;">
                             <div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: white; color: #1C2826; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #eee;">
                               ${child.name}
                             </div>
                           </div>`;
            markers.current[childId] = new maplibregl.Marker({ element: el })
              .setLngLat(pos)
              .addTo(map);
          }
        }
      });

      // --- RENDER GEOFENCES ---
      if (map.getLayer("geofence-fill")) map.removeLayer("geofence-fill");
      if (map.getLayer("geofence-stroke")) map.removeLayer("geofence-stroke");
      if (map.getSource("geofences-src")) map.removeSource("geofences-src");

      const displayGeofences = selectedChildId === "all"
        ? geofences
        : geofences.filter(g => g.childId === selectedChildId);

      const geofenceFeatures = displayGeofences
        .map(zone => {
          const lat = zone.center?.lat ?? zone.lat;
          const lng = zone.center?.lng ?? zone.lng;
          const radius = zone.radius;
          if (typeof lat === "number" && typeof lng === "number") {
            return getGeoJSONCircle([lng, lat], radius);
          }
          return null;
        })
        .filter(Boolean) as any[];

      map.addSource("geofences-src", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: geofenceFeatures
        }
      });

      map.addLayer({
        id: "geofence-fill",
        type: "fill",
        source: "geofences-src",
        paint: {
          "fill-color": "#3B82F6",
          "fill-opacity": 0.1
        }
      });

      map.addLayer({
        id: "geofence-stroke",
        type: "line",
        source: "geofences-src",
        paint: {
          "line-color": "#3B82F6",
          "line-width": 2,
          "line-dasharray": [2, 2]
        }
      });

      // --- PREVIEW CIRCLE ---
      if (map.getLayer("preview-fill")) map.removeLayer("preview-fill");
      if (map.getLayer("preview-stroke")) map.removeLayer("preview-stroke");
      if (map.getSource("preview-src")) map.removeSource("preview-src");

      if (previewPoint && typeof previewPoint.lat === "number" && typeof previewPoint.lng === "number") {
        map.addSource("preview-src", {
          type: "geojson",
          data: getGeoJSONCircle([previewPoint.lng, previewPoint.lat], previewPoint.radius)
        });

        map.addLayer({
          id: "preview-fill",
          type: "fill",
          source: "preview-src",
          paint: {
            "fill-color": "#D64550",
            "fill-opacity": 0.2
          }
        });

        map.addLayer({
          id: "preview-stroke",
          type: "line",
          source: "preview-src",
          paint: {
            "line-color": "#D64550",
            "line-width": 3
          }
        });
      }

      // --- RENDER HISTORY POLYLINE ---
      if (map.getLayer("history-line")) map.removeLayer("history-line");
      if (map.getSource("history-src")) map.removeSource("history-src");

      if (selectedChildId !== "all" && Array.isArray(history)) {
        const pathCoords = history
          .filter(p => p && typeof p.lat === "number" && typeof p.lng === "number")
          .map(p => [p.lng, p.lat] as [number, number]);
          
        if (pathCoords.length > 1) {
          map.addSource("history-src", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: pathCoords
              },
              properties: {}
            }
          });

          map.addLayer({
            id: "history-line",
            type: "line",
            source: "history-src",
            paint: {
              "line-color": "#8B5CF6",
              "line-width": 3,
              "line-dasharray": [2, 2]
            }
          });
        }
      }

      // --- CAMERA / FOCUS WORK ---
      const coords: [number, number][] = [];
      displayChildren.forEach(child => {
        const loc = child.location || child.lastLocation;
        if (loc?.lat && loc?.lng) coords.push([loc.lng, loc.lat]);
      });

      if (previewPoint) {
        // Keep current view while placing geofence
      } else if (selectedChildId !== "all" && markers.current[selectedChildId]) {
        map.easeTo({
          center: markers.current[selectedChildId].getLngLat(),
          zoom: 15,
          duration: 1000
        });
      } else if (coords.length > 0) {
        if (coords.length === 1) {
          map.easeTo({ center: coords[0], zoom: 15, duration: 1000 });
        } else {
          try {
            const bounds = coords.reduce((acc, coord) => {
              return acc.extend(coord);
            }, new maplibregl.LngLatBounds(coords[0], coords[0]));

            map.fitBounds(bounds, { padding: 50, duration: 1000 });
          } catch (e) {
            console.warn("Could not fit bounds:", e);
          }
        }
      }
    };

    if (map.isStyleLoaded()) {
      renderMapElements();
    } else {
      map.once("style.load", renderMapElements);
    }

  }, [isMapCNLoaded, childrenData, selectedChildId, geofences, history, previewPoint]);

  return (
    <div className="w-full h-full relative group z-0 overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-app-green/20"
        style={{ background: "#f8fafc" }}
      />
      {!isMapCNLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[2px] z-20">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-app-salmon border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-bold text-app-jet/40 uppercase tracking-widest">Initialising Tracking...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
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
