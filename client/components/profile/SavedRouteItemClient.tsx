"use client";

import { Navigation } from "lucide-react";

interface SavedRouteLinkProps {
  routeId: string;
}

export default function SavedRouteLink({}: SavedRouteLinkProps) {
  // This could handle navigation or tracking in the future
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#2bee6c] transition-colors group-hover:bg-[#2bee6c] group-hover:text-white">
      <Navigation className="h-5 w-5" />
    </div>
  );
}
