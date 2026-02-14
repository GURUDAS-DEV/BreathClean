"use client";

import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Coordinates = {
  lng: number;
  lat: number;
};

type RouteData = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
};

type RouteMapBackgroundProps = {
  source: Coordinates | null;
  destination: Coordinates | null;
  routes: RouteData[];
  selectedRouteIndex: number;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function RouteMapBackground({
  source,
  destination,
  routes,
  selectedRouteIndex,
}: RouteMapBackgroundProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{
    source: mapboxgl.Marker | null;
    dest: mapboxgl.Marker | null;
  }>({ source: null, dest: null });

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Map loaded
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update routes on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoutes = () => {
      // Clean up stale layers/sources
      // we check all previously tracked layers or just iterate widely if we didn't track them before (but we added tracking now)
      // For safety, let's remove any layer starting with route- that is beyond our current count, or just rebuild keys.

      // First, remove layers that are no longer needed or refresh all
      // The prompt asks to "base the loop on actual routes array length... and remove any stale layers"
      // Let's assume we maintain route-{i}

      // Cleanup layers/sources that exceed current routes length
      // We can check strictly locally based on index
      // But simpler: ensure route-i exists for i < length, and remove for i >= length
      let i = 0;
      while (true) {
        const id = `route-${i}`;
        const exists = map.getSource(id);
        if (!exists && i >= routes.length) break; // No more layers to check

        if (i >= routes.length) {
          // Remove stale
          if (map.getLayer(id)) map.removeLayer(id);
          if (map.getSource(id)) map.removeSource(id);
        } else {
          // Create or Update
          const route = routes[i];
          if (!map.getSource(id)) {
            map.addSource(id, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: route.geometry.coordinates as [number, number][],
                },
              },
            });
            map.addLayer({
              id: id,
              type: "line",
              source: id,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#2bee6c",
                "line-width": 4,
                "line-opacity": 0.5,
              },
            });
          } else {
            (map.getSource(id) as mapboxgl.GeoJSONSource).setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.geometry.coordinates as [number, number][],
              },
            });
          }
        }
        i++;
      }

      // Fit map
      if (routes.length > 0 && routes[0].geometry.coordinates.length > 0) {
        const coordinates = routes[0].geometry.coordinates; // Use primary route for bounds
        // Fix: Use LngLatBounds properly
        const bounds = new mapboxgl.LngLatBounds(
          coordinates[0] as [number, number],
          coordinates[0] as [number, number]
        );

        // We can traverse all routes to get full bounds if desired,
        // but using the first route is usually sufficient or we can extend with others.
        routes.forEach((r) => {
          r.geometry.coordinates.forEach((coord) => {
            bounds.extend(coord as [number, number]);
          });
        });

        map.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 450, right: 450 },
          duration: 1000,
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateRoutes();
    } else {
      map.once("styledata", updateRoutes);
    }

    // Cleanup listener if effect re-runs (mostly relevant if we had a persistent listener)
    return () => {
      map.off("styledata", updateRoutes);
    };
  }, [routes]);

  // Update route styles based on selected route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateStyles = () => {
      // We iterate based on routes length, or check existence
      // Assuming we created up to routes.length-1
      // But to be safe, we can check 0..10 or just loop routes.
      // Let's loop routes length as layers should correspond
      routes.forEach((_, i) => {
        const layerId = `route-${i}`;
        if (map.getLayer(layerId)) {
          map.setPaintProperty(
            layerId,
            "line-color",
            i === selectedRouteIndex ? "#2bee6c" : "#94a3b8"
          );
          map.setPaintProperty(
            layerId,
            "line-width",
            i === selectedRouteIndex ? 6 : 4
          );
          map.setPaintProperty(
            layerId,
            "line-opacity",
            i === selectedRouteIndex ? 1 : 0.6
          );
        }
      });
    };

    if (map.isStyleLoaded()) {
      updateStyles();
    } else {
      map.once("styledata", updateStyles);
    }

    return () => {
      map.off("styledata", updateStyles);
    };
  }, [selectedRouteIndex, routes]);

  // Add markers for source and destination
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !source || !destination) return;

    // Capture current ref value to use in cleanup
    const currentMarkers = markersRef.current;

    // Clean up existing markers
    if (currentMarkers.source) currentMarkers.source.remove();
    if (currentMarkers.dest) currentMarkers.dest.remove();

    // Add source marker (green)
    const sourceMarker = new mapboxgl.Marker({ color: "#2bee6c" })
      .setLngLat([source.lng, source.lat])
      .addTo(map);
    currentMarkers.source = sourceMarker;

    // Add destination marker (red)
    const destMarker = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);
    currentMarkers.dest = destMarker;

    // Cleanup on unmount (optional but good practice)
    return () => {
      if (currentMarkers.source) currentMarkers.source.remove();
      if (currentMarkers.dest) currentMarkers.dest.remove();
    };
  }, [source, destination]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
