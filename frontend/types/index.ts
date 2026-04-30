// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = "low" | "medium" | "high" | "critical";
export type AlertType =
  | "location"
  | "geofence"
  | "sos"
  | "battery"
  | "device"
  | "app_usage";

export type ActivityType =
  | "location_update"
  | "geofence_enter"
  | "geofence_exit"
  | "sos_trigger"
  | "app_usage"
  | "device_activity";

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  deviceName: string;
  batteryLevel: number;
  isOnline: boolean;
  lastSeen: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  safeStatus: "safe" | "warning" | "alert";
  school: string;
  grade: string;
}

export interface Alert {
  id: string;
  _id?: string;
  childId: string;
  childName: string;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  description?: string;
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  status?: "active" | "resolved";
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface ActivityItem {
  id: string;
  childId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: "home" | "school" | "custom";
  radius: number;
  isActive: boolean;
  lat: number;
  lng: number;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  color: string;
}

export interface HistoryLog {
  id: string;
  childId: string;
  childName: string;
  event: string;
  location: string;
  timestamp: string;
  type: ActivityType;
}
