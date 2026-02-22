"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
}: {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocate?: () => void;
}) {
  return (
    <div className="absolute right-3 bottom-74 z-40 flex flex-col gap-2 lg:right-[352px] lg:bottom-8">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="flex size-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="flex size-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button
        onClick={onLocate}
        aria-label="Locate me"
        className="mt-2 flex size-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <LocateFixed className="h-5 w-5" />
      </button>
    </div>
  );
}
