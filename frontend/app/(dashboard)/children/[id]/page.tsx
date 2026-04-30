"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { childrenAPI, activityAPI } from "@/lib/api";
import { ChildProfile } from "@/components/child/ChildProfile";
import { LocationMap } from "@/components/child/LocationMap";
import { ActivityTimeline } from "@/components/child/ActivityTimeline";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function ChildDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [child, setChild] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [childRes, activityRes] = await Promise.all([
          childrenAPI.getOne(id),
          activityAPI.get(id, { limit: 10 })
        ]) as any;

        if (childRes.success && childRes.child) {
          // Normalize _id to id for component compatibility
          const normalizedChild = {
            ...childRes.child,
            id: childRes.child._id,
            location: childRes.child.lastLocation || null
          };
          setChild(normalizedChild);
          setActivities(activityRes.activities || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching child data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-app-salmon animate-spin" />
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-app-jet/60 font-medium">Child not found or error loading data.</p>
        <Link href="/dashboard" className="text-app-salmon hover:underline text-sm font-bold uppercase tracking-widest">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-app-jet/50 hover:text-app-jet transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-app-jet/30">/</span>
        <span className="text-sm font-medium text-app-jet">{child.name}</span>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Profile + Map */}
        <div className="lg:col-span-3 space-y-5">
          <ChildProfile child={child} />
          <LocationMap child={child} />
        </div>

        {/* Right: Activity */}
        <div className="lg:col-span-2">
          <SectionWrapper
            title="Activity Timeline"
            description="Recent events"
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
