// Type definitions
interface Coordinate {
  lat: number;
  lon: number;
}

interface RouteGeometry {
  type: string;
  coordinates: [number, number][]; // [lon, lat] format from GeoJSON
}

interface RouteInput {
  distance: number; // in kilometers
  duration: number;
  routeGeometry: RouteGeometry;
}

interface RouteBreakpoints {
  point_1?: Coordinate;
  point_2?: Coordinate;
  point_3?: Coordinate;
  point_4?: Coordinate;
  point_5?: Coordinate;
  point_6?: Coordinate;
  point_7?: Coordinate;
}

/**
 * Calculate the number of breakpoints based on route distance
 * - Under 100 km: 3 points
 * - 100-500 km: 3-4 points
 * - Above 500 km: 3-4 points (reduced to prevent API timeouts)
 */
function calculateBreakpointCount(distance: number): number {
  if (distance < 100) {
    return 3;
  } else if (distance >= 100 && distance <= 500) {
    // Scale between 3-4 based on distance
    return distance < 300 ? 3 : 4;
  } else {
    // For very long routes, use 3-4 points to prevent timeouts
    return distance < 750 ? 3 : 4;
  }
}

/**
 * Check if two coordinates are the same (within a small tolerance)
 */
function areCoordinatesEqual(
  coord1: Coordinate,
  coord2: Coordinate,
  tolerance: number = 0.0001
): boolean {
  return (
    Math.abs(coord1.lat - coord2.lat) < tolerance &&
    Math.abs(coord1.lon - coord2.lon) < tolerance
  );
}

/**
 * Extract evenly spaced breakpoints from a route's coordinates
 */
function extractBreakpoints(
  coordinates: [number, number][],
  count: number,
  usedCoordinates: Coordinate[],
  routeLabel: string = "unknown"
): Coordinate[] {
  const totalCoords = coordinates.length;
  if (totalCoords < 2) {
    return []; // Should be caught by computeBreakpoints validation
  }
  const breakpoints: Coordinate[] = [];

  // Calculate evenly spaced indices, avoiding start (0) and end (totalCoords-1)
  // We'll distribute points evenly across the route
  for (let i = 0; i < count; i++) {
    // Calculate position as a fraction of the route (avoiding 0 and 1)
    const fraction = (i + 1) / (count + 1);
    const index = Math.floor(fraction * totalCoords);

    // Ensure index is within bounds and not at the very start or end
    const safeIndex = Math.max(1, Math.min(index, totalCoords - 2));

    // Convert from GeoJSON [lon, lat] to our Coordinate {lat, lon}
    const coordAtIndex = coordinates[safeIndex];
    if (!coordAtIndex) {
      continue; // Skip if coordinate is undefined
    }
    const coordinate: Coordinate = {
      lat: coordAtIndex[1],
      lon: coordAtIndex[0],
    };

    // Check if this coordinate is already used
    const isDuplicate = usedCoordinates.some((used) =>
      areCoordinatesEqual(coordinate, used)
    );

    if (!isDuplicate) {
      breakpoints.push(coordinate);
      usedCoordinates.push(coordinate);
    } else {
      // If duplicate, try nearby indices
      let offset = 1;
      let found = false;
      while (!found && offset < 10) {
        for (const direction of [1, -1]) {
          const altIndex = safeIndex + offset * direction;
          if (altIndex > 0 && altIndex < totalCoords - 1) {
            const altCoordAtIndex = coordinates[altIndex];
            if (!altCoordAtIndex) {
              continue; // Skip if coordinate is undefined
            }
            const altCoordinate: Coordinate = {
              lat: altCoordAtIndex[1],
              lon: altCoordAtIndex[0],
            };

            const isAltDuplicate = usedCoordinates.some((used) =>
              areCoordinatesEqual(altCoordinate, used)
            );

            if (!isAltDuplicate) {
              breakpoints.push(altCoordinate);
              usedCoordinates.push(altCoordinate);
              found = true;
              break;
            }
          }
        }
        offset++;
      }

      // If still not found after trying nearby indices, skip this point to guarantee uniqueness
      if (!found) {
        console.warn(
          `[Route ${routeLabel}] Skipping duplicate breakpoint at index ${safeIndex} (${coordinate.lat}, ${coordinate.lon}) because no unique alternative was found nearby.`
        );
      }
    }
  }

  return breakpoints;
}

/**
 * Compute breakpoints for multiple routes
 *
 * @param routes - Array of route objects (max 3 routes)
 * @returns Array of route breakpoints with unique coordinates
 *
 * @example
 * const routes = [
 *   { distance: 218.4, duration: 337.2, routeGeometry: {...} },
 *   { distance: 268.5, duration: 415.2, routeGeometry: {...} }
 * ];
 * const breakpoints = computeBreakpoints(routes);
 * // Returns:
 * // [
 * //   { point_1: {lat, lon}, point_2: {lat, lon}, point_3: {lat, lon} },
 * //   { point_1: {lat, lon}, point_2: {lat, lon}, point_3: {lat, lon} }
 * // ]
 */
export function computeBreakpoints(routes: RouteInput[]): RouteBreakpoints[] {
  if (!routes || routes.length === 0) {
    throw new Error("No routes provided");
  }

  if (routes.length > 3) {
    throw new Error("Maximum 3 routes allowed");
  }

  // Track all used coordinates to ensure uniqueness across routes
  const usedCoordinates: Coordinate[] = [];
  const result: RouteBreakpoints[] = [];

  for (const route of routes) {
    const { distance, routeGeometry } = route;

    if (!routeGeometry || !routeGeometry.coordinates) {
      throw new Error("Invalid route geometry");
    }

    if (routeGeometry.coordinates.length < 2) {
      throw new Error(
        "Insufficient coordinates in route geometry (minimum 2 required)"
      );
    }

    // Calculate how many breakpoints we need for this route
    const breakpointCount = calculateBreakpointCount(distance);

    // Extract breakpoints
    const breakpoints = extractBreakpoints(
      routeGeometry.coordinates,
      breakpointCount,
      usedCoordinates,
      result.length.toString()
    );

    // Build the route breakpoints object
    const routeBreakpoints: RouteBreakpoints = {};
    breakpoints.forEach((coord, index) => {
      const key = `point_${index + 1}` as keyof RouteBreakpoints;
      routeBreakpoints[key] = coord;
    });

    result.push(routeBreakpoints);
  }

  console.log(
    `Computed breakpoints for ${routes.length} routes with ${usedCoordinates.length} total unique points`
  );

  return result;
}
