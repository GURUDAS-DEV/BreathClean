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
      // Add route sources and layers
      for (let i = 0; i < 3; i++) {
        map.addSource(`route-${i}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        map.addLayer({
          id: `route-${i}`,
          type: "line",
          source: `route-${i}`,
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
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update routes on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update route data
    routes.forEach((route, index) => {
      const source = map.getSource(`route-${index}`) as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.geometry.coordinates,
          },
        });
      }
    });

    // Fit map to show all routes
    if (routes.length > 0 && routes[0].geometry.coordinates.length > 0) {
      const coordinates = routes[0].geometry.coordinates;
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(
          coordinates[0] as [number, number],
          coordinates[0] as [number, number]
        )
      );

      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 450, right: 450 },
        duration: 1000,
      });
    }
  }, [routes]);

  // Update route styles based on selected route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update line styles for all routes
    for (let i = 0; i < 3; i++) {
      if (map.getLayer(`route-${i}`)) {
        map.setPaintProperty(
          `route-${i}`,
          "line-color",
          i === selectedRouteIndex ? "#2bee6c" : "#94a3b8"
        );
        map.setPaintProperty(
          `route-${i}`,
          "line-width",
          i === selectedRouteIndex ? 6 : 4
        );
        map.setPaintProperty(
          `route-${i}`,
          "line-opacity",
          i === selectedRouteIndex ? 1 : 0.6
        );
      }
    }
  }, [selectedRouteIndex]);

  // Add markers for source and destination
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !source || !destination) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add source marker (green)
    new mapboxgl.Marker({ color: "#2bee6c" })
      .setLngLat([source.lng, source.lat])
      .addTo(map);

    // Add destination marker (red)
    new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);
  }, [source, destination]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
