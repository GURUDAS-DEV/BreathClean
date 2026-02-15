"use client";

import { useEffect, useRef } from "react";

import { AlertTriangle, Ruler, Timer, Wind } from "lucide-react";

type TravelMode = "walking" | "driving" | "cycling";

export type RouteData = {
  distance: number;
  duration: number;
  trafficDuration?: number;
  trafficFactor?: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  overallScore?: number;
  weatherScore?: number;
  aqiScore?: {
    aqi: number; // Raw AQI value
    score: number; // 0-100 score
    category: string; // Good, Moderate, Unhealthy, etc.
  };
  trafficScore?: number;
  pollutionReductionPct?: number;
  exposureWarning?: string;
};

type RouteComparisonPanelProps = {
  routes: RouteData[];
  isLoading: boolean;
  scoresLoading: boolean;
  error: string | null;
  selectedMode: TravelMode;
  selectedRouteIndex: number;
  onRouteSelect: (index: number) => void;
};

const getCategoryColor = (category: string): string => {
  const baseClasses = "rounded-full px-2 py-0.5 text-[10px] font-bold";

  if (category === "Excellent") {
    return `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
  }

  if (category === "Good") {
    return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
  }

  if (category === "Moderate") {
    return `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`;
  }

  if (category.includes("Sensitive")) {
    return `${baseClasses} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`;
  }

  if (category === "Unhealthy") {
    return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
  }

  if (category === "Very Unhealthy") {
    return `${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`;
  }

  if (category === "Hazardous") {
    return `${baseClasses} bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400`;
  }

  return `${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400`;
};

export default function RouteComparisonPanel({
  routes,
  isLoading,
  scoresLoading,
  error,
  selectedMode,
  selectedRouteIndex,
  onRouteSelect,
}: RouteComparisonPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when routes load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [routes, isLoading]);
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDistance = (meters: number): string => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  const getBestRouteIndex = (allRoutes: RouteData[]) => {
    const maxScore = Math.max(...allRoutes.map((r) => r.overallScore ?? -1));
    if (maxScore <= 0) return 0;
    // Among routes with the max score, pick the fastest
    const candidates = allRoutes
      .map((r, i) => ({
        i,
        score: r.overallScore ?? -1,
        dur: r.trafficDuration ?? r.duration,
      }))
      .filter((c) => c.score === maxScore);
    candidates.sort((a, b) => a.dur - b.dur);
    return candidates[0]?.i ?? 0;
  };

  const getRouteLabel = (
    route: RouteData,
    allRoutes: RouteData[],
    index: number
  ) => {
    const bestIdx = getBestRouteIndex(allRoutes);
    const minDuration = Math.min(
      ...allRoutes.map((r) => r.trafficDuration ?? r.duration)
    );
    const routeDur = route.trafficDuration ?? route.duration;

    if (index === bestIdx && (route.overallScore ?? 0) > 0)
      return "Cleanest Path";
    if (routeDur === minDuration) return "Fastest";
    return "Balanced";
  };

  // Shared route card content
  const renderRouteCard = (
    route: RouteData,
    index: number,
    isMobile: boolean
  ) => {
    const isSelected = index === selectedRouteIndex;
    return (
      <div
        key={index}
        onClick={() => onRouteSelect(index)}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-xl transition-all dark:bg-slate-800 ${
          isMobile ? "shrink-0 snap-start" : "hover:scale-[1.02]"
        } ${
          isSelected
            ? "border-[#2bee6c] ring-2 ring-[#2bee6c]/20"
            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
        }`}
        style={isMobile ? { width: "280px", minWidth: "280px" } : undefined}
      >
        {!scoresLoading &&
          index === getBestRouteIndex(routes) &&
          (route.overallScore ?? 0) > 0 && (
            <div className="absolute -top-3 right-0 p-2">
              <span className="rounded-full border border-[#2bee6c]/20 bg-[#2bee6c]/10 px-2 py-1 text-[10px] font-bold tracking-tight text-[#2bee6c] uppercase">
                Best for Health
              </span>
            </div>
          )}
        <div className={isMobile ? "p-4" : "p-5"}>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                {getRouteLabel(route, routes, index)}
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
              {scoresLoading ? (
                <>
                  <div className="ml-auto h-7 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-1 ml-auto h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </>
              ) : (
                <>
                  <span
                    className={`text-2xl font-black ${(() => {
                      const score = route.overallScore ?? 0;
                      const allScores = routes.map((r) => r.overallScore ?? 0);
                      const maxScore = Math.max(...allScores);
                      const minScore = Math.min(...allScores);
                      const isLowest =
                        score === minScore && minScore < maxScore;
                      if (isLowest) return "text-slate-400 dark:text-slate-500";
                      if (score >= 80) return "text-[#2bee6c]";
                      if (score >= 50) return "text-orange-500";
                      return "text-slate-500 dark:text-slate-400";
                    })()}`}
                  >
                    {route.overallScore != null
                      ? Math.round(route.overallScore)
                      : "—"}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400">
                    HEALTH SCORE
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Timer className="text-slate-400" size={14} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {formatDuration(route.trafficDuration ?? route.duration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="text-slate-400" size={14} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {formatDistance(route.distance)}
              </span>
            </div>
          </div>
          {route.trafficFactor != null && route.trafficFactor > 1.0 && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-700/50">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      route.trafficFactor >= 1.5
                        ? "bg-red-400"
                        : route.trafficFactor >= 1.2
                          ? "bg-orange-400"
                          : "bg-yellow-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      route.trafficFactor >= 1.5
                        ? "bg-red-500"
                        : route.trafficFactor >= 1.2
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }`}
                  />
                </span>
                <span
                  className={`text-xs font-semibold ${
                    route.trafficFactor >= 1.5
                      ? "text-red-600 dark:text-red-400"
                      : route.trafficFactor >= 1.2
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  +
                  {formatDuration(
                    (route.trafficDuration ?? route.duration) - route.duration
                  )}{" "}
                  delay
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  route.trafficFactor >= 1.5
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : route.trafficFactor >= 1.2
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {route.trafficFactor}x slower
              </span>
            </div>
          )}
          {scoresLoading ? (
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ) : (
            <>
              {/* AQI Display */}
              {route.aqiScore && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Wind className="text-slate-400" size={14} />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Air Quality
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${getCategoryColor(route.aqiScore.category)}`}
                    >
                      {route.aqiScore.category}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {Math.round(route.aqiScore.aqi)}
                    </span>
                  </div>
                </div>
              )}
              {route.pollutionReductionPct !== undefined && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Pollution Exposure
                  </span>
                  <span className="text-xs font-bold text-[#2bee6c]">
                    -{route.pollutionReductionPct}% avg.
                  </span>
                </div>
              )}
              {route.exposureWarning && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <AlertTriangle size={14} />
                  {route.exposureWarning}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Skeleton card
  const renderSkeleton = (i: number, isMobile: boolean) => (
    <div
      key={i}
      className={`animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 ${
        isMobile ? "shrink-0 snap-start" : ""
      }`}
      style={isMobile ? { width: "280px", minWidth: "280px" } : undefined}
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
  );

  return (
    <>
      {/* ===== MOBILE: Bottom Sheet with Horizontal Scroll ===== */}
      <div className="absolute inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-slate-900/95">
          {/* Section header */}
          <div className="px-4 pt-3 pb-2">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              {isLoading
                ? "Finding routes..."
                : routes.length > 0
                  ? `${routes.length} routes found`
                  : "Routes"}
            </h3>
          </div>

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {isLoading ? (
              [1, 2, 3].map((i) => renderSkeleton(i, true))
            ) : error ? (
              <div className="w-full shrink-0 rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-900/20">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            ) : routes.length > 0 ? (
              routes.map((route, index) => renderRouteCard(route, index, true))
            ) : null}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Original Right Sidebar ===== */}
      <aside className="absolute top-6 right-6 z-40 hidden w-80 flex-col gap-4 lg:flex">
        {isLoading ? (
          [1, 2, 3].map((i) => renderSkeleton(i, false))
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        ) : routes.length > 0 ? (
          routes.map((route, index) => renderRouteCard(route, index, false))
        ) : null}
      </aside>
    </>
  );
}
