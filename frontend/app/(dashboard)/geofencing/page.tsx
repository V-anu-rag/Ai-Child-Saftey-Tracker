"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  Home,
  School,
  Compass,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import { geofencesAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useChildren } from "@/hooks/useChildren";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/activity/LiveMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-app-jet/20 font-bold uppercase tracking-widest text-xs">Loading Map...</div>
});

const typeIcons = {
  home: Home,
  school: School,
  custom: Compass,
};

const typeColors = {
  home: "bg-app-green/40 text-green-700",
  school: "bg-app-salmon/20 text-orange-700",
  custom: "bg-purple-100 text-purple-700",
};

export default function GeofencingPage() {
  const { children, isLoading: childrenLoading } = useChildren();
  const [geofences, setGeofences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation state
  const [isPlacing, setIsPlacing] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    radius: 200,
    childId: "",
    type: "custom" as keyof typeof typeIcons
  });
  const [previewPoint, setPreviewPoint] = useState<{ lat: number, lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const res = await geofencesAPI.getAll() as any;
      setGeofences(res.geofences || []);
    } catch (err) {
      console.error("Failed to fetch geofences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await geofencesAPI.toggle(id);
      setGeofences(prev => prev.map(z => (z._id || z.id) === id ? { ...z, isActive: !z.isActive } : z));
    } catch (err) {
      console.error("Failed to toggle zone:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      await geofencesAPI.remove(id);
      setGeofences(prev => prev.filter(z => (z._id || z.id) !== id));
    } catch (err) {
      console.error("Failed to delete zone:", err);
    }
  };

  // This function now just sets a preview point
  const handleMapClick = (lat: number, lng: number) => {
    if (!isPlacing) return;
    setPreviewPoint({ lat, lng });
  };

  // Final confirmation to save the zone
  const handleSaveZone = async () => {
    if (!newZone.childId || !newZone.name || !previewPoint) {
      alert("Please ensure child name is set and you have clicked a location on the map.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await geofencesAPI.create({
        childId: newZone.childId,
        name: newZone.name,
        center: {
          lat: previewPoint.lat,
          lng: previewPoint.lng
        },
        radius: newZone.radius,
        type: newZone.type
      }) as any;
      
      setGeofences(prev => [res.geofence, ...prev]);
      setIsPlacing(false);
      setPreviewPoint(null);
      setNewZone({ name: "", radius: 200, childId: "", type: "custom" });
    } catch (err) {
      console.error("Failed to create zone:", err);
      alert("Failed to save zone. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-app-jet">Geofencing</h2>
          <p className="text-sm text-app-jet/50 mt-1">
            Manage safe zones and location alerts
          </p>
        </div>
        <Button 
          size="sm" 
          variant={isPlacing ? "outline" : "primary"}
          leftIcon={isPlacing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          onClick={() => {
            setIsPlacing(!isPlacing);
            setPreviewPoint(null);
          }}
        >
          {isPlacing ? "Cancel" : "Add Safe Zone"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {isPlacing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <SectionWrapper title="1. Configure Zone" description="Set name and radius first">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-jet/40">Target Child</label>
                    <select 
                      value={newZone.childId}
                      onChange={(e) => setNewZone(prev => ({ ...prev, childId: e.target.value }))}
                      className="w-full bg-app-bg border border-app-green/20 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-app-salmon"
                    >
                      <option value="">Select a child...</option>
                      {children.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-jet/40">Zone Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Home, School"
                      value={newZone.name}
                      onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-app-bg border border-app-green/20 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-app-salmon"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-jet/40">Radius ({newZone.radius}m)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={newZone.radius}
                        onChange={(e) => setNewZone(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                        className="flex-1 accent-app-salmon"
                      />
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          )}

          <SectionWrapper title={isPlacing ? "2. Click on Map to Select Location" : "Interactive Map"} noPadding>
            <div className="p-5">
              <div className="h-[500px] rounded-2xl overflow-hidden border border-app-green/30 relative">
                <LiveMap 
                  childrenData={children as any[]} 
                  selectedChildId="all"
                  geofences={geofences}
                  onMapClick={handleMapClick}
                  previewPoint={previewPoint ? { ...previewPoint, radius: newZone.radius } : null}
                />
                
                <AnimatePresence>
                    {isPlacing && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/4 -translate-x-1/2 z-[450] w-[90%] md:w-[70%]"
                      >
                        <div className="bg-app-jet/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-app-salmon rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-app-salmon/20">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest">
                                {previewPoint ? `Confirm: ${newZone.name || 'New Zone'}` : 'Select Location'}
                              </p>
                              <p className="text-[10px] text-white/60">
                                {previewPoint ? 'Click Save to finalize' : 'Click anywhere on the map'}
                              </p>
                            </div>
                          </div>
                          
                          {previewPoint && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button 
                                  size="sm" 
                                  className="flex-1 md:flex-none bg-white text-app-jet hover:bg-white/90"
                                  leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                  onClick={handleSaveZone}
                                  disabled={isSaving}
                                >
                                  {isSaving ? "Saving..." : "Save Safe Zone"}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-white border-white/20 hover:bg-white/10"
                                  onClick={() => setPreviewPoint(null)}
                                >
                                  Reset
                                </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </SectionWrapper>
        </div>

        {/* Zone List */}
        <div className="lg:col-span-2">
          <SectionWrapper
            title="Active Zones"
            description={`${geofences.filter((z) => z.isActive).length} currently active`}
            noPadding
          >
            <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto">
              <AnimatePresence>
                {geofences.map((zone, i) => {
                  const Icon = typeIcons[zone.type as keyof typeof typeIcons] || Compass;
                  const child = children.find(c => (c._id || c.id) === zone.childId);
                  return (
                    <motion.div
                      key={zone._id || zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "rounded-xl border p-4 transition-all group",
                        zone.isActive
                          ? "bg-white border-app-green/40 shadow-sm"
                          : "bg-app-bg/40 border-app-green/20 opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            typeColors[zone.type as keyof typeof typeColors] || typeColors.custom
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                               <p className="text-sm font-bold text-app-jet">{zone.name}</p>
                               <p className="text-[10px] font-bold text-app-jet/40 uppercase">{child?.name || 'Child'}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggle((zone._id || zone.id)!)}
                                className="text-app-jet/40 hover:text-app-jet transition-colors"
                              >
                                {zone.isActive ? (
                                  <ToggleRight className="w-6 h-6 text-green-600" />
                                ) : (
                                  <ToggleLeft className="w-6 h-6" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete((zone._id || zone.id)!)}
                                className="text-app-jet/40 hover:text-app-red p-1.5 hover:bg-app-red/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-app-jet/40">
                            <span>{zone.radius}m radius</span>
                            <span className="w-1 h-1 bg-app-jet/20 rounded-full" />
                            <span>{zone.type || 'Custom'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loading && geofences.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-app-bg/50 rounded-xl animate-pulse" />)}
                </div>
              )}

              {!loading && geofences.length === 0 && (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="w-16 h-16 bg-app-bg rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-app-jet/20" />
                  </div>
                  <p className="text-sm font-black text-app-jet/60 uppercase tracking-widest">No zones found</p>
                  <p className="text-xs text-app-jet/40 mt-1">Start by adding a safe zone for your children</p>
                </div>
              )}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
