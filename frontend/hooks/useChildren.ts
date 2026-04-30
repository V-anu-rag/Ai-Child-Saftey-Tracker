"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { childrenAPI } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import type { Child } from "@/types";

interface LocationUpdate {
  childId: string;
  latitude: number;
  longitude: number;
  batteryLevel?: number;
  timestamp: string;
}

interface UseChildrenReturn {
  children: Child[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateChildLocation: (childId: string, data: Partial<Child>) => void;
}

export function useChildren(): UseChildrenReturn {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { on, off } = useSocket();

  const fetchChildren = useCallback(async () => {
    try {
      setError(null);
      const res = await childrenAPI.getAll() as any;
      setChildren(res.children || []);
    } catch (err: any) {
      setError(err.message || "Failed to load children");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Live location updates via socket
  useEffect(() => {
    const handleLocationUpdate = (data: LocationUpdate) => {
      setChildren((prev) =>
        prev.map((c) =>
          c.id === data.childId
            ? {
                ...c,
                isOnline: true,
                batteryLevel: data.batteryLevel ?? c.batteryLevel,
                location: {
                  ...c.location,
                  lat: data.latitude,
                  lng: data.longitude,
                  timestamp: data.timestamp,
                },
              }
            : c
        )
      );
    };

    const handleStatusChange = (data: { childId: string; isOnline: boolean; batteryLevel?: number }) => {
      setChildren((prev) =>
        prev.map((c) =>
          c.id === data.childId
            ? { ...c, isOnline: data.isOnline, batteryLevel: data.batteryLevel ?? c.batteryLevel }
            : c
        )
      );
    };

    const handleChildRemoved = (data: { childId: string; childName: string; message: string }) => {
      // Immediately remove the child from the list
      setChildren((prev) => prev.filter((c) => c.id !== data.childId && (c as any)._id !== data.childId));
    };

    on("location-update", handleLocationUpdate);
    on("child-status", handleStatusChange);
    on("child-removed", handleChildRemoved);

    return () => {
      off("location-update", handleLocationUpdate);
      off("child-status", handleStatusChange);
      off("child-removed", handleChildRemoved);
    };
  }, [on, off]);

  const updateChildLocation = useCallback(
    (childId: string, data: Partial<Child>) => {
      setChildren((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, ...data } : c))
      );
    },
    []
  );

  return { children, isLoading, error, refresh: fetchChildren, updateChildLocation };
}
