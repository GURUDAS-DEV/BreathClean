"use client";

import { Suspense, useCallback, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

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
  duration: number; // in seconds
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  aqiScore?: number;
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
  const warning = `BreathClean Dev Warning: MAPBOX_TOKEN is empty (value: "${MAPBOX_TOKEN}"). Mapbox API calls will fail.`;
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
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

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
      console.error(
        `Aborting reverseGeocode: MAPBOX_TOKEN is missing (value: "${MAPBOX_TOKEN}").`
      );
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `Geocoding API Error: ${response.status} ${response.statusText}`;
        console.error(`${errorMsg} | Body: ${errorText}`);
        // Return clear error string to caller instead of fallback coordinates
        return `${errorMsg}`;
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      // Network/Runtime errors: Log and return fallback coordinates
      console.error("Geocoding network/runtime error:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Fetch routes from Mapbox Directions API
  const fetchRoutes = useCallback(
    async (mode: TravelMode) => {
      if (!source || !destination) return;
      if (!MAPBOX_TOKEN) {
        setError("Mapbox configuration error: Missing Token");
        console.error(
          `Aborting fetchRoutes: MAPBOX_TOKEN is missing (value: "${MAPBOX_TOKEN}").`
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const profile = `mapbox/${mode}`;
        const coordinates = `${source.lng},${source.lat};${destination.lng},${destination.lat}`;

        // Request multiple alternative routes
        const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinates}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

        const response = await fetch(url);

        // Check for HTTP errors before parsing JSON
        if (!response.ok) {
          let errorDetails = response.statusText;
          try {
            const errorClone = response.clone();
            const errorJson = await errorClone.json();
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = await response.text();
          }

          console.error(
            `FetchRoutes HTTP error: ${response.status} ${response.statusText}`,
            errorDetails
          );
          setError(
            `Route fetch failed: ${response.status} ${response.statusText}`
          );
          setRoutes([]);
          return;
        }

        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          // Take up to 3 routes
          const fetchedRoutes = data.routes
            .slice(0, 3)
            .map((route: MapboxRoute, index: number) => {
              // Placeholder/Demo data logic
              let aqiScore = 80;
              let pollutionReductionPct: number | undefined = undefined;
              let exposureWarning: string | undefined = undefined;

              if (index === 0) {
                aqiScore = 92;
                pollutionReductionPct = 34;
              } else if (index === 1) {
                aqiScore = 74;
              } else {
                aqiScore = 42;
                exposureWarning = "High PM2.5 Exposure Zone";
              }

              return {
                distance: route.distance,
                duration: route.duration,
                geometry: route.geometry,
                aqiScore,
                pollutionReductionPct,
                exposureWarning,
              };
            });
          setRoutes(fetchedRoutes);
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

  return (
    <div className="font-display flex h-screen flex-col overflow-hidden bg-[#f6f8f6] text-slate-900 dark:bg-[#102216]">
      {!MAPBOX_TOKEN && process.env.NODE_ENV !== "production" && (
        <div className="absolute top-20 left-1/2 z-[100] -translate-x-1/2 animate-bounce rounded-full bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-xl">
          DEV WARNING: MAPBOX_TOKEN is missing!
        </div>
      )}
      <main className="relative mt-12 flex-1 overflow-hidden">
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
        />
        <RouteComparisonPanel
          routes={routes}
          isLoading={isLoading}
          error={error}
          selectedMode={selectedMode}
          selectedRouteIndex={selectedRouteIndex}
          onRouteSelect={handleRouteSelect}
        />
        {!isLoading && !error && routes.length > 0 && (
          <InsightToast
            pm25Reduction={routes[selectedRouteIndex]?.pollutionReductionPct}
          />
        )}
        <MapControls />
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
