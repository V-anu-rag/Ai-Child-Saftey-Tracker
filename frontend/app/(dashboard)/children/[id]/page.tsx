"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { useChildTracking } from "@/hooks/useChildTracking";
import { ChildProfile } from "@/components/child/ChildProfile";
import { ActivityTimeline } from "@/components/child/ActivityTimeline";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import Link from "next/link";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/activity/LiveMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-app-jet/20 font-bold uppercase tracking-widest text-xs">Initializing Map...</div>
});

export default function ChildDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { child, activities, geofences, loading, error, refresh } = useChildTracking(id);

  if (loading && !child) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-app-salmon animate-spin" />
          <p className="text-sm font-bold text-app-jet/40 uppercase tracking-widest">Connecting to device...</p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-app-red">
          <Loader2 className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-app-jet font-bold text-lg">Unable to locate child profile</p>
          <p className="text-app-jet/50 text-sm mt-1">{error || "The child might have been removed or the ID is invalid."}</p>
        </div>
        <Link href="/dashboard" className="mt-4 text-app-salmon hover:underline text-xs font-bold uppercase tracking-widest border border-app-salmon/20 px-6 py-2 rounded-full">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-app-jet/50 hover:text-app-jet transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-app-jet/30">/</span>
          <span className="text-sm font-bold text-app-jet">{child.name}</span>
        </div>

        <button 
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-app-green/30 text-xs font-bold text-app-jet/60 hover:bg-app-bg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Force Sync
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Profile + Map */}
        <div className="lg:col-span-3 space-y-5">
          <ChildProfile child={child} />
          <div className="h-[400px] rounded-2xl overflow-hidden border border-app-green/40 shadow-sm">
            <LiveMap 
              childrenData={[child] as any} 
              selectedChildId={child.id} 
              geofences={geofences}
            />
          </div>
        </div>

        {/* Right: Activity */}
        <div className="lg:col-span-2">
          <SectionWrapper
            title="Real-time Activity"
            description="Recent security & movement events"
            noPadding
          >
            <div className="p-6">
              <ActivityTimeline activities={activities} />
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}

