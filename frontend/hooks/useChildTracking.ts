"use client";

import { useState, useEffect, useCallback } from "react";
import { childrenAPI, activityAPI, geofencesAPI } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { Child, ActivityItem, GeofenceZone } from "@/types";

export function useChildTracking(childId: string) {
  const { on, off } = useSocket();
  const [child, setChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);

      const [childRes, activityRes, geoRes] = await Promise.all([
        childrenAPI.getOne(childId),
        activityAPI.get(childId, { limit: 15 }),
        geofencesAPI.getAll({ childId })
      ]) as any;

      if (childRes.success && childRes.child) {
        // Normalize child data
        const normalizedChild = {
          ...childRes.child,
          id: childRes.child._id,
          isPaired: !!childRes.child.userId,
          location: childRes.child.lastLocation || null
        };
        setChild(normalizedChild);

        // Normalize activities to match ActivityItem type
        const normalizedActivities = (activityRes.timeline || []).map((a: any) => ({
          ...a,
          id: a.id || a._id,
          // Map backend types to frontend types
          type: a.type === "location" ? "location_update" : 
                a.alertType === "sos" ? "sos_trigger" :
                a.alertType === "geofence_enter" ? "geofence_enter" :
                a.alertType === "geofence_exit" ? "geofence_exit" : "device_activity",
          description: a.message || a.description,
          location: a.coords ? `${a.coords.lat}, ${a.coords.lng}` : (a.location?.address || a.location)
        }));

        setActivities(normalizedActivities);
        setGeofences(geoRes.geofences || []);
      } else {
        setError("Child not found");
      }
    } catch (err: any) {
      console.error("Error fetching tracking data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time socket updates
  useEffect(() => {
    if (!childId) return;

    const handleLocationUpdate = (data: any) => {
      // Only process if it's for the current child
      if (data.childId === childId || data._id === childId) {
        setChild(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            location: {
              lat: data.latitude,
              lng: data.longitude,
              address: data.address || prev.location?.address,
              timestamp: data.timestamp || new Date().toISOString()
            },
            batteryLevel: data.batteryLevel !== undefined ? data.batteryLevel : prev.batteryLevel,
            isOnline: true,
            lastSeen: data.timestamp || new Date().toISOString()
          };
        });
      }
    };

    const handleActivityUpdate = (activity: any) => {
      if (activity.childId === childId) {
        setActivities(prev => {
          // Prevent duplicates
          if (prev.some(a => (a.id || (a as any)._id) === (activity.id || activity._id))) return prev;
          return [activity, ...prev].slice(0, 20);
        });
        
        // Also update child status if it's a specific event
        if (activity.type === "geofence_exit") {
          setChild(prev => prev ? { ...prev, safeStatus: "warning" } : null);
        } else if (activity.type === "geofence_enter") {
          setChild(prev => prev ? { ...prev, safeStatus: "safe" } : null);
        } else if (activity.type === "sos_trigger") {
          setChild(prev => prev ? { ...prev, safeStatus: "alert" } : null);
        }
      }
    };

    const handleStatusUpdate = (data: any) => {
      if (data.childId === childId) {
        setChild(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            isOnline: data.isOnline,
            batteryLevel: data.batteryLevel !== undefined ? data.batteryLevel : prev.batteryLevel,
            lastSeen: new Date().toISOString()
          };
        });
      }
    };

    on("location-update", handleLocationUpdate);
    on("activity-received", handleActivityUpdate);
    on("status-update", handleStatusUpdate);

    return () => {
      off("location-update", handleLocationUpdate);
      off("activity-received", handleActivityUpdate);
      off("status-update", handleStatusUpdate);
    };
  }, [childId, on, off]);

  return {
    child,
    activities,
    geofences,
    loading,
    error,
    refresh: fetchData
  };
}
