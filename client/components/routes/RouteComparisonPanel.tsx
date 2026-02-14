"use client";

import { AlertTriangle, Ruler, Timer } from "lucide-react";

type TravelMode = "walking" | "driving" | "cycling";

type RouteData = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
};

type RouteComparisonPanelProps = {
  routes: RouteData[];
  isLoading: boolean;
  error: string | null;
  selectedMode: TravelMode;
  selectedRouteIndex: number;
  onRouteSelect: (index: number) => void;
};

export default function RouteComparisonPanel({
  routes,
  isLoading,
  error,
  selectedMode,
  selectedRouteIndex,
  onRouteSelect,
}: RouteComparisonPanelProps) {
  // Format duration (seconds to readable format)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format distance (meters to km)
  const formatDistance = (meters: number): string => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  return (
    <aside className="absolute top-6 right-6 z-40 flex w-80 flex-col gap-4">
      {isLoading ? (
        // Skeleton Loading
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        // Error State
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      ) : routes.length > 0 ? (
        // Route Cards
        routes.map((route, index) => (
          <div
            key={index}
            onClick={() => onRouteSelect(index)}
            className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-xl transition-all hover:scale-[1.02] dark:bg-slate-800 ${
              index === selectedRouteIndex
                ? "border-[#2bee6c] ring-2 ring-[#2bee6c]/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            {index === 0 && (
              <div className="absolute top-0 right-0 p-2">
                <span className="rounded-full border border-[#2bee6c]/20 bg-[#2bee6c]/10 px-2 py-1 text-[10px] font-bold tracking-tight text-[#2bee6c] uppercase">
                  Best for Health
                </span>
              </div>
            )}
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    {index === 0
                      ? "Cleanest Path"
                      : index === 1
                        ? "Balanced"
                        : "Fastest"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    via{" "}
                    {selectedMode === "walking"
                      ? "Pedestrian Paths"
                      : selectedMode === "driving"
                        ? "Main Roads"
                        : "Bike Lanes"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-black ${index === 0 ? "text-[#2bee6c]" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {index === 0 ? 92 : index === 1 ? 74 : 42}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400">
                    AQI SCORE
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="text-slate-400" size={16} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {formatDuration(route.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="text-slate-400" size={16} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {formatDistance(route.distance)}
                  </span>
                </div>
              </div>
              {index === 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Pollution Exposure
                  </span>
                  <span className="text-xs font-bold text-[#2bee6c]">
                    -34% avg.
                  </span>
                </div>
              )}
              {index === 2 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <AlertTriangle size={14} />
                  High PM2.5 Exposure Zone
                </div>
              )}
            </div>
          </div>
        ))
      ) : null}
    </aside>
  );
}
