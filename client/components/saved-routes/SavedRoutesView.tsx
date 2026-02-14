"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setSelectedSubRouteIndex(0);
  };

  const handleDeleteRoute = async (routeId: string) => {
    // Optimistic update
    const previousRoutes = [...routes];
    setRoutes((prev) => prev.filter((r) => r._id !== routeId));

    // If the deleted route was selected, select the first available one
    if (selectedRouteId === routeId) {
      const remaining = routes.filter((r) => r._id !== routeId);
      setSelectedRouteId(remaining.length > 0 ? remaining[0]._id : null);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saved-routes/${routeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete route");
      }

      toast.success("Route deleted successfully");
      router.refresh(); // Sync with server
    } catch (error) {
      console.error("Delete route error:", error);
      toast.error("Failed to delete route");
      // Revert optimistic update
      setRoutes(previousRoutes);
      if (selectedRouteId === routeId) setSelectedRouteId(routeId);
    }
  };

  const selectedRoute = routes.find((r) => r._id === selectedRouteId) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8f6] dark:bg-[#102216]">
      <div className="flex flex-1 pt-14">
        {routes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
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
            <div className="hidden flex-1 lg:block">
              <RouteMap
                routes={routes}
                selectedRouteId={selectedRouteId}
                selectedSubRouteIndex={selectedSubRouteIndex}
              />
            </div>

            {/* Right panel - insights */}
            {selectedRoute && (
              <div className="hidden overflow-auto xl:block">
                <RouteInsightsPanel
                  route={selectedRoute}
                  subRouteIndex={selectedSubRouteIndex}
                  onDelete={handleDeleteRoute}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
