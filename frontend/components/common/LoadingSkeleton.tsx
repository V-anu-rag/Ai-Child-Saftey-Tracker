"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg skeleton-shimmer h-4",
        className
      )}
    />
  );
}

export function LoadingSkeleton({ className, rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-app-green/40 p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-1/3" />
        </div>
      </div>
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-3/4" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-app-green/40 p-6 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-1/4 h-8" />
          <SkeletonLine className="w-1/2" />
        </div>
        <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-app-bg space-y-4">
      <div className="w-12 h-12 border-4 border-app-red border-t-transparent rounded-full animate-spin" />
      <div className="text-sm font-bold text-app-jet/40 tracking-widest uppercase">SafeTrack</div>
    </div>
  );
}
