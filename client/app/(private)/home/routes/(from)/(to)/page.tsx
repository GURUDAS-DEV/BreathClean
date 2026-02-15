"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import { Bookmark, Tag, X } from "lucide-react";
import { toast } from "sonner";

import InsightToast from "@/components/routes/InsightToast";
import MapControls from "@/components/routes/MapControls";
import RouteComparisonPanel from "@/components/routes/RouteComparisonPanel";
import RouteDiscoveryPanel from "@/components/routes/RouteDiscoveryPanel";
import RouteMapBackground from "@/components/routes/RouteMapBackground";

// Types
type Coordinates = {
  lng: number;
  lat: number;
};

type RouteData = {
  distance: number; // in meters
  duration: number; // in seconds (base, without traffic)
  trafficDuration?: number; // in seconds (with live traffic, driving only)
  trafficFactor?: number; // trafficDuration / duration (1.0 = no traffic)
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  overallScore?: number;
  weatherScore?: number;
  trafficScore?: number;
  pollutionReductionPct?: number;
  exposureWarning?: string;
};

type TravelMode = "walking" | "driving" | "cycling";

type MapboxRoute = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

if (!MAPBOX_TOKEN) {
  const warning =
    "BreathClean Dev Warning: MAPBOX_TOKEN is empty. Mapbox API calls will fail.";
  if (process.env.NODE_ENV !== "production") {
    console.warn(warning);
  }
}

const RouteContent = () => {
  const searchParams = useSearchParams();
  const [source, setSource] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [destAddress, setDestAddress] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<TravelMode>("driving");
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeName, setRouteName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);

  // Parse query parameters
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam && toParam) {
      const [fromLng, fromLat] = fromParam.split(",").map(Number);
      const [toLng, toLat] = toParam.split(",").map(Number);

      if (
        !isNaN(fromLng) &&
        !isNaN(fromLat) &&
        !isNaN(toLng) &&
        !isNaN(toLat)
      ) {
        setSource({ lng: fromLng, lat: fromLat });
        setDestination({ lng: toLng, lat: toLat });

        // Fetch addresses for source and destination
        reverseGeocode(fromLng, fromLat).then(setSourceAddress);
        reverseGeocode(toLng, toLat).then(setDestAddress);
      }
    }
  }, [searchParams]);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    if (!MAPBOX_TOKEN) {
      console.error("Aborting reverseGeocode: MAPBOX_TOKEN is missing.");
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Geocoding HTTP error: ${response.status} ${response.statusText} | Body: ${errorBody}`
        );
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      // Only swallow network/runtime errors so we return coordinates as fallback
      // ideally we might want to surface this, but the UI expects a string
      console.error("Geocoding failed:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Fetch scores from backend scoring API
  const fetchScores = async (routeData: RouteData[], mode: TravelMode) => {
    setScoresLoading(true);
    try {
      const payload = {
        routes: routeData.map((r) => ({
          distance: r.distance / 1000,
          duration: r.duration / 60,
          routeGeometry: r.geometry,
          travelMode: mode,
        })),
        traffic:
          mode === "driving"
            ? routeData.map((r) => {
                const factor = r.trafficFactor ?? 1;
                return Math.min(Math.max((factor - 1) * 3, 0), 3);
              })
            : [],
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/score/compute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.error("Score API error:", response.status);
        return;
      }

      const data = await response.json();
      const scoredRoutes = data.data?.routes;
      if (scoredRoutes && Array.isArray(scoredRoutes)) {
        const scores = scoredRoutes.map(
          (sr: {
            overallScore: number;
            weatherScore: { overall: number };
            trafficScore: number;
          }) => ({
            overall: sr.overallScore,
            weather: sr.weatherScore?.overall,
            traffic: sr.trafficScore,
          })
        );
        const overallScores = scores.map((s: { overall: number }) => s.overall);
        const maxScore = Math.max(...overallScores);
        const minScore = Math.min(...overallScores);

        // Find best route: highest score wins; if tied, pick the fastest
        let bestIndex = 0;
        let bestDuration = Infinity;
        overallScores.forEach((score: number, i: number) => {
          const dur =
            routes[i]?.trafficDuration ?? routes[i]?.duration ?? Infinity;
          if (
            score > overallScores[bestIndex] ||
            (score === overallScores[bestIndex] && dur < bestDuration)
          ) {
            bestIndex = i;
            bestDuration = dur;
          }
        });
        setSelectedRouteIndex(bestIndex);

        setRoutes((prev) =>
          prev.map((route, i) => {
            const s = scores[i];
            const score = s?.overall ?? undefined;
            const reductionPct =
              maxScore > minScore && score === maxScore
                ? Math.round(((maxScore - minScore) / maxScore) * 100)
                : undefined;
            const warning =
              score != null && score < 50 ? "High Exposure Zone" : undefined;
            return {
              ...route,
              overallScore: score,
              weatherScore: s?.weather,
              trafficScore: s?.traffic,
              pollutionReductionPct: reductionPct,
              exposureWarning: warning,
            };
          })
        );
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
    } finally {
      setScoresLoading(false);
    }
  };

  // Fetch routes from Mapbox Directions API
  const fetchRoutes = useCallback(
    async (mode: TravelMode) => {
      if (!source || !destination) return;
      if (!MAPBOX_TOKEN) {
        setError("Mapbox configuration error: Missing Token");
        console.error("Aborting fetchRoutes: MAPBOX_TOKEN is missing.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const coordinates = `${source.lng},${source.lat};${destination.lng},${destination.lat}`;
        const baseProfile = `mapbox/${mode}`;

        // Base request (without traffic)
        const baseUrl = `https://api.mapbox.com/directions/v5/${baseProfile}/${coordinates}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

        // For driving, also fetch traffic-aware durations in parallel
        const trafficUrl =
          mode === "driving"
            ? `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?alternatives=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
            : null;

        const [baseResponse, trafficResponse] = await Promise.all([
          fetch(baseUrl),
          trafficUrl ? fetch(trafficUrl) : Promise.resolve(null),
        ]);

        if (!baseResponse.ok) {
          const errorText = await baseResponse.text();
          console.error(
            `FetchRoutes HTTP error: ${baseResponse.status} ${baseResponse.statusText}`,
            errorText
          );
          setError(
            `Route fetch failed: ${baseResponse.status} ${baseResponse.statusText}`
          );
          setRoutes([]);
          return;
        }

        const data = await baseResponse.json();

        // Parse traffic routes and build a lookup by distance for matching
        let trafficRoutes: MapboxRoute[] = [];
        if (trafficResponse && trafficResponse.ok) {
          const trafficData = await trafficResponse.json();
          if (trafficData.code === "Ok" && trafficData.routes) {
            trafficRoutes = trafficData.routes;
          }
        }

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          // Take up to 3 routes
          const fetchedRoutes: RouteData[] = data.routes
            .slice(0, 3)
            .map((route: MapboxRoute) => {
              // Match this base route to the closest traffic route by distance
              let trafficDuration: number | undefined;
              let trafficFactor: number | undefined;
              if (trafficRoutes.length > 0) {
                const matched = trafficRoutes.reduce((best, tr) => {
                  const diff = Math.abs(tr.distance - route.distance);
                  const bestDiff = Math.abs(best.distance - route.distance);
                  return diff < bestDiff ? tr : best;
                }, trafficRoutes[0]);

                // Only accept match if distances are within 10% of each other
                const distDiffPct =
                  Math.abs(matched.distance - route.distance) / route.distance;
                if (distDiffPct < 0.3) {
                  trafficDuration = matched.duration;
                  trafficFactor =
                    Math.round((matched.duration / route.duration) * 100) / 100;
                }
              }

              return {
                distance: route.distance,
                duration: route.duration,
                trafficDuration,
                trafficFactor,
                geometry: route.geometry,
              };
            });
          setRoutes(fetchedRoutes);
          fetchScores(fetchedRoutes, mode);
        } else {
          setError("No routes found. Please try different locations.");
          setRoutes([]);
        }
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to fetch routes. Please try again.");
        setRoutes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [source, destination]
  );

  // Fetch routes when source, destination, or mode changes
  useEffect(() => {
    if (source && destination) {
      fetchRoutes(selectedMode);
    }
  }, [source, destination, selectedMode, fetchRoutes]);

  // Handle mode toggle
  const handleModeChange = (mode: TravelMode) => {
    setSelectedMode(mode);
    setSelectedRouteIndex(0); // Reset to first route when mode changes
  };

  // Handle route selection
  const handleRouteSelect = (index: number) => {
    setSelectedRouteIndex(index);
  };

  // Open save modal
  const handleSaveClick = () => {
    setShowSaveModal(true);
    // Focus input after modal renders
    setTimeout(() => saveInputRef.current?.focus(), 100);
  };

  // Save route function
  const saveRoute = async () => {
    if (!source || !destination || routes.length === 0) return;
    if (!routeName.trim()) {
      toast.error("Please enter a route name.");
      return;
    }

    const nameToSave = routeName.trim();

    try {
      const payload = {
        name: nameToSave,
        from: {
          address: sourceAddress,
          location: {
            type: "Point",
            coordinates: [source.lng, source.lat],
          },
        },
        to: {
          address: destAddress,
          location: {
            type: "Point",
            coordinates: [destination.lng, destination.lat],
          },
        },
        routes: routes.map((route) => ({
          distance: route.distance / 1000,
          duration: route.duration / 60,
          routeGeometry: route.geometry,
          lastComputedScore:
            route.overallScore || Math.floor(Math.random() * 100),
          lastComputedAt: new Date(),
          travelMode: selectedMode,
        })),
        isFavorite: false,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saved-routes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Save route response:", data);

      if (!response.ok) {
        console.error("Save route failed:", data);
        toast.error(data.message || "Failed to save route");
        return;
      }

      toast.success("Route saved successfully!");
      setShowSaveModal(false);
      setRouteName("");
    } catch (error) {
      console.error("Save route error:", error);
      toast.error("An error occurred while saving the route");
    }
  };

  return (
    <div className="font-display flex h-screen flex-col overflow-hidden bg-[#f6f8f6] text-slate-900 md:pt-12 dark:bg-[#102216]">
      <main className="relative flex-1 overflow-hidden">
        <RouteMapBackground
          source={source}
          destination={destination}
          routes={routes}
          selectedRouteIndex={selectedRouteIndex}
        />
        <RouteDiscoveryPanel
          sourceAddress={sourceAddress}
          destAddress={destAddress}
          selectedMode={selectedMode}
          onModeChange={handleModeChange}
          onSaveRoute={handleSaveClick}
          canSave={!isLoading && !error && routes.length > 0}
        />
        <RouteComparisonPanel
          routes={routes}
          isLoading={isLoading}
          scoresLoading={scoresLoading}
          error={error}
          selectedMode={selectedMode}
          selectedRouteIndex={selectedRouteIndex}
          onRouteSelect={handleRouteSelect}
        />
        <InsightToast />
        <MapControls />

        {/* Save Route Modal */}
        {showSaveModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Save Route
                </h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                Route Name <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-3 rounded-lg border-2 border-slate-200 bg-slate-50 p-3 transition-all focus-within:border-[#2bee6c] focus-within:ring-2 focus-within:ring-[#2bee6c]/20 dark:border-slate-700 dark:bg-slate-800">
                <Tag className="text-[#2bee6c]" size={18} />
                <input
                  ref={saveInputRef}
                  className="w-full border-none bg-transparent p-0 text-sm placeholder:text-slate-400 focus:ring-0 focus:outline-none dark:text-white"
                  placeholder="e.g. Morning Commute"
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && routeName.trim()) saveRoute();
                  }}
                />
              </div>
              {!routeName.trim() && (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Give your route a name to save it.
                </p>
              )}

              <button
                onClick={saveRoute}
                disabled={!routeName.trim()}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-lg transition-all ${
                  routeName.trim()
                    ? "bg-[#2bee6c] text-slate-900 shadow-[#2bee6c]/20 hover:bg-[#2bee6c]/90"
                    : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                }`}
              >
                <Bookmark className="h-5 w-5" />
                Save Route
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function RoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#f6f8f6] dark:bg-[#102216]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2bee6c] border-t-transparent" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading route parameters...
            </p>
          </div>
        </div>
      }
    >
      <RouteContent />
    </Suspense>
  );
}
