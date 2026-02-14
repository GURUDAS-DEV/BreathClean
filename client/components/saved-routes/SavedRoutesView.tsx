"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "./EmptyState";
import RouteInsightsPanel from "./RouteInsightsPanel";
import RouteMap from "./RouteMap";
import SavedRoutesList from "./SavedRoutesList";
import type { ISavedRoute } from "./types";

interface SavedRoutesViewProps {
  routes: ISavedRoute[];
}

export default function SavedRoutesView({
  routes: initialRoutes,
}: SavedRoutesViewProps) {
  const router = useRouter();
  const [routes, setRoutes] = useState<ISavedRoute[]>(initialRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    initialRoutes.length > 0 ? initialRoutes[0]._id : null
  );
  const [selectedSubRouteIndex, setSelectedSubRouteIndex] = useState(0);

  // Mobile: list vs detail view
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setSelectedSubRouteIndex(0);
  };

  // On mobile, tapping a card goes to detail view
  const handleMobileSelectRoute = (routeId: string) => {
    handleSelectRoute(routeId);
    setMobileView("detail");
  };

  // When routes change and selected one is gone, reset
  useEffect(() => {
    if (selectedRouteId && !routes.find((r) => r._id === selectedRouteId)) {
      setSelectedRouteId(routes.length > 0 ? routes[0]._id : null);
      setMobileView("list");
    }
  }, [routes, selectedRouteId]);

  const handleDeleteRoute = async (routeId: string) => {
    const previousRoutes = [...routes];
    setRoutes((prev) => prev.filter((r) => r._id !== routeId));

    if (selectedRouteId === routeId) {
      const remaining = routes.filter((r) => r._id !== routeId);
      setSelectedRouteId(remaining.length > 0 ? remaining[0]._id : null);
      setMobileView("list");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saved-routes/${routeId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete route");

      toast.success("Route deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Delete route error:", error);
      toast.error("Failed to delete route");
      setRoutes(previousRoutes);
      if (selectedRouteId === routeId) setSelectedRouteId(routeId);
    }
  };

  const selectedRoute = routes.find((r) => r._id === selectedRouteId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f8f6] dark:bg-[#102216]">
      <div className="flex min-h-0 flex-1 pt-14">
        {routes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ===== MOBILE LAYOUT (< lg) ===== */}
            <div className="flex min-h-0 w-full flex-1 flex-col lg:hidden">
              {mobileView === "list" ? (
                /* Mobile List View */
                <SavedRoutesList
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  selectedSubRouteIndex={selectedSubRouteIndex}
                  onSelectRoute={handleMobileSelectRoute}
                  onSelectSubRoute={setSelectedSubRouteIndex}
                  onDeleteRoute={handleDeleteRoute}
                />
              ) : (
                /* Mobile Detail View */
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Detail Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#102216]">
                    <button
                      onClick={() => setMobileView("list")}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {selectedRoute?.name || "Route Details"}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {selectedRoute?.routes.length} route
                        {(selectedRoute?.routes.length ?? 0) > 1
                          ? "s"
                          : ""}{" "}
                        saved
                      </p>
                    </div>
                  </div>

                  {/* Map (compact) */}
                  <div className="h-48 flex-shrink-0">
                    <RouteMap
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      selectedSubRouteIndex={selectedSubRouteIndex}
                    />
                  </div>

                  {/* Insights (scrollable) */}
                  {selectedRoute && (
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <RouteInsightsPanel
                        route={selectedRoute}
                        subRouteIndex={selectedSubRouteIndex}
                        onDelete={handleDeleteRoute}
                        onSubRouteSelect={setSelectedSubRouteIndex}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===== DESKTOP LAYOUT (lg+) ===== */}
            <div className="hidden min-h-0 flex-1 lg:flex">
              {/* Left sidebar - route list */}
              <SavedRoutesList
                routes={routes}
                selectedRouteId={selectedRouteId}
                selectedSubRouteIndex={selectedSubRouteIndex}
                onSelectRoute={handleSelectRoute}
                onSelectSubRoute={setSelectedSubRouteIndex}
                onDeleteRoute={handleDeleteRoute}
              />

              {/* Center - map */}
              <div className="flex-1">
                <RouteMap
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  selectedSubRouteIndex={selectedSubRouteIndex}
                />
              </div>

              {/* Right panel - insights */}
              {selectedRoute && (
                <div className="min-h-0 overflow-hidden xl:block">
                  <RouteInsightsPanel
                    route={selectedRoute}
                    subRouteIndex={selectedSubRouteIndex}
                    onDelete={handleDeleteRoute}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
