"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

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

export interface RouteMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  locate: () => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const RouteMapBackground = forwardRef<RouteMapHandle, RouteMapBackgroundProps>(
  function RouteMapBackground(
    { source, destination, routes, selectedRouteIndex },
    ref
  ) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapLoadedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
      locate: () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            mapRef.current?.flyTo({
              center: [coords.longitude, coords.latitude],
              zoom: 14,
              essential: true,
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 6000 }
        );
      },
    }));
    const pendingUpdateRef = useRef<(() => void) | null>(null);
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
        center: [78.9, 22.5],
        zoom: 4,
      });

      mapRef.current = map;

      map.on("load", () => {
        mapLoadedRef.current = true;
        // If routes arrived before map loaded, replay the pending update
        if (pendingUpdateRef.current) {
          pendingUpdateRef.current();
          pendingUpdateRef.current = null;
        }
      });

      return () => {
        map.remove();
        mapLoadedRef.current = false;
      };
    }, []);

    // Track previous geometry to avoid re-fitting bounds when only scores/selection change
    const prevGeometryRef = useRef<string>("");

    // Update routes on map and apply selection styles in a single effect
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const applyStyles = () => {
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

      const updateRoutes = () => {
        // Cleanup layers/sources that exceed current routes length
        let i = 0;
        while (true) {
          const id = `route-${i}`;
          const exists = map.getSource(id);
          if (!exists && i >= routes.length) break;

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
                    coordinates: route.geometry.coordinates as [
                      number,
                      number,
                    ][],
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

        // Only fit bounds when geometry actually changes (not on score/selection updates)
        const geometryKey = routes
          .map((r) => `${r.geometry.coordinates.length}`)
          .join(",");
        if (
          geometryKey !== prevGeometryRef.current &&
          routes.length > 0 &&
          routes[0].geometry.coordinates.length > 0
        ) {
          prevGeometryRef.current = geometryKey;
          const bounds = new mapboxgl.LngLatBounds();
          routes.forEach((r) => {
            r.geometry.coordinates.forEach((coord) => {
              bounds.extend(coord as [number, number]);
            });
          });
          map.fitBounds(bounds, {
            padding: { top: 180, bottom: 260, left: 50, right: 50 },
            maxZoom: 15,
            duration: 1000,
          });
        }

        // Apply styles immediately after sources/layers are ready
        applyStyles();
      };

      if (mapLoadedRef.current) {
        updateRoutes();
      } else {
        pendingUpdateRef.current = updateRoutes;
      }

      return () => {
        pendingUpdateRef.current = null;
      };
    }, [routes, selectedRouteIndex]);

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
);

export default RouteMapBackground;
