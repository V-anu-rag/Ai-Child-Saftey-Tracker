import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const past = new Date(date);
  if (isNaN(past.getTime())) return "Never";

  const now = new Date();
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getSeverityColor(severity: "low" | "medium" | "high" | "critical") {
  const map = {
    low: "text-green-700 bg-green-100 border-green-200",
    medium: "text-yellow-700 bg-yellow-100 border-yellow-200",
    high: "text-orange-700 bg-orange-100 border-orange-200",
    critical: "text-red-700 bg-red-100 border-red-200",
  };
  return map[severity];
}

/**
 * Global "Coming Soon" handler
 */
export const comingSoon = (e?: React.MouseEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  import("sonner").then(({ toast }) => {
    toast.info("Feature Coming Soon!", {
      description: "We're working hard to bring this feature to you. Stay tuned for updates!",
      icon: "🚀",
      duration: 4000,
      position: "top-center",
    });
  });
};

