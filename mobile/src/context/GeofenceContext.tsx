import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { geofencesAPI } from "../api/client";
import { useAuth } from "./AuthContext";

interface GeofenceContextType {
  geofences: any[];
  isLoading: boolean;
  fetchGeofences: () => Promise<void>;
  addGeofence: (geofence: any) => void;
  removeGeofence: (id: string) => Promise<void>;
  toggleGeofence: (id: string) => Promise<void>;
}

const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);

export const GeofenceProvider = ({ children }: { children: ReactNode }) => {
  const [geofences, setGeofences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Clear sensitive cached data when user logs out
    if (!isAuthenticated) {
      setGeofences([]);
    }
  }, [isAuthenticated]);

  const fetchGeofences = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await geofencesAPI.getAll() as any;
      setGeofences(res.geofences || []);
    } catch (err) {
      console.error("GeofenceContext fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addGeofence = useCallback((newGeofence: any) => {
    setGeofences((prev) => [...prev, newGeofence]);
  }, []);

  const removeGeofence = useCallback(async (id: string) => {
    // Optimistic UI update
    setGeofences((prev) => prev.filter((z) => z._id !== id));
    try {
      await geofencesAPI.remove(id);
    } catch (err) {
      console.error("GeofenceContext remove error:", err);
      // Revert if API fails
      fetchGeofences();
      throw err;
    }
  }, [fetchGeofences]);

  const toggleGeofence = useCallback(async (id: string) => {
    // Optimistic UI update
    setGeofences((prev) =>
      prev.map((z) => (z._id === id ? { ...z, isActive: !z.isActive } : z))
    );
    try {
      await geofencesAPI.toggle(id);
    } catch (err) {
      console.error("GeofenceContext toggle error:", err);
      // Revert if API fails
      fetchGeofences();
      throw err;
    }
  }, [fetchGeofences]);

  return (
    <GeofenceContext.Provider
      value={{
        geofences,
        isLoading,
        fetchGeofences,
        addGeofence,
        removeGeofence,
        toggleGeofence,
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export const useGeofences = () => {
  const context = useContext(GeofenceContext);
  if (context === undefined) {
    throw new Error("useGeofences must be used within a GeofenceProvider");
  }
  return context;
};
