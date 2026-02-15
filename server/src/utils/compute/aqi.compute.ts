import type { Coordinate, RoutePoints } from "./weather.compute.js";

//
// Type definitions for AQI data

// AQI data structure based on AQICN API response
export interface AQIData {
  aqi: number; // Air Quality Index value
  dominentpol?: string | undefined; // Dominant pollutant (pm25, pm10, o3, etc.)
  iaqi?:
    | {
        // Individual Air Quality Index for each pollutant
        pm25?: { v: number };
        pm10?: { v: number };
        o3?: { v: number };
        no2?: { v: number };
        so2?: { v: number };
        co?: { v: number };
      }
    | undefined;
  time?:
    | {
        s: string; // ISO timestamp
        tz: string; // Timezone
      }
    | undefined;
}

// Full AQI API response
interface AQIAPIResponse {
  status: string;
  data?: {
    aqi: number;
    idx?: number;
    dominentpol?: string;
    iaqi?: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
    time?: {
      s: string;
      tz: string;
      v: number;
    };
    city?: {
      name: string;
      geo: [number, number];
    };
  };
}

export interface PointAQIResult {
  point: string;
  coordinate: Coordinate;
  aqi: AQIData | null;
  error?: string;
}

export interface RouteAQIResult {
  routeIndex: number;
  points: PointAQIResult[];
  totalPoints: number;
  successfulFetches: number;
}

/**
 * Fetches AQI data for a single coordinate point using AQICN API
 * Returns AQI data or null if fetch fails
 */
async function fetchAQIForPoint(
  lat: number,
  lon: number
): Promise<AQIData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    // AQICN API endpoint for geo-located data
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.AQI_API_KEY}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      console.error(`AQI API error for (${lat}, ${lon}): ${response.status}`);
      return null;
    }

    const apiResponse = (await response.json()) as AQIAPIResponse;

    // Check if the API returned valid data
    if (apiResponse.status !== "ok" || !apiResponse.data) {
      console.error(
        `AQI API returned invalid status for (${lat}, ${lon}):`,
        apiResponse.status
      );
      return null;
    }

    const data = apiResponse.data;

    // Extract and return the AQI data
    const aqiData: AQIData = {
      aqi: data.aqi,
      dominentpol: data.dominentpol,
      iaqi: data.iaqi,
      time: data.time
        ? {
            s: data.time.s,
            tz: data.time.tz,
          }
        : undefined,
    };

    return aqiData;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`AQI API timeout for (${lat}, ${lon})`);
    } else {
      console.error(`Failed to fetch AQI for (${lat}, ${lon}):`, error);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Computes AQI data for multiple routes with multiple points
 *
 * @param routes - Array of route objects, each containing point_1, point_2, point_3, etc.
 * @returns Array of AQI results for each route
 */
export async function computeAQI(
  routes: RoutePoints[]
): Promise<RouteAQIResult[]> {
  try {
    if (!routes || routes.length === 0) {
      throw new Error("No routes provided");
    }

    if (!process.env.AQI_API_KEY) {
      throw new Error("AQI_API_KEY not configured");
    }

    // Task definition for batching
    interface PointTask {
      routeIndex: number;
      pointKey: string;
      point: Coordinate;
    }

    // Step 1: Collect ALL points that need AQI data from ALL routes
    const allPointTasks: PointTask[] = [];
    routes.forEach((route, routeIndex) => {
      for (let i = 1; i <= 7; i++) {
        const pointKey = `point_${i}` as keyof RoutePoints;
        const point = route[pointKey];
        if (point && point.lat !== undefined && point.lon !== undefined) {
          allPointTasks.push({ routeIndex, pointKey, point });
        }
      }
    });

    // Step 2: Execute fetches in batches (Concurrency Limiter)
    // No more than N requests in parallel to avoid quota/resource issues
    const pointResultsMap = new Map<number, PointAQIResult[]>();
    const CONCURRENCY_LIMIT = 5;

    for (let i = 0; i < allPointTasks.length; i += CONCURRENCY_LIMIT) {
      const batch = allPointTasks.slice(i, i + CONCURRENCY_LIMIT);

      // Execute this batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (task) => {
          const aqiData = await fetchAQIForPoint(
            task.point.lat,
            task.point.lon
          );

          const result: PointAQIResult = {
            point: task.pointKey,
            coordinate: task.point,
            aqi: aqiData,
          };

          if (aqiData === null) {
            result.error = "Failed to fetch AQI (timeout or API error)";
          }

          return { routeIndex: task.routeIndex, result };
        })
      );

      // Store results in the map grouped by routeIndex
      batchResults.forEach(({ routeIndex, result }) => {
        if (!pointResultsMap.has(routeIndex)) {
          pointResultsMap.set(routeIndex, []);
        }
        pointResultsMap.get(routeIndex)!.push(result);
      });
    }

    // Step 3: Format the results back to the expected RouteAQIResult[] structure
    const results: RouteAQIResult[] = routes.map((_, routeIndex) => {
      const pointResults = pointResultsMap.get(routeIndex) || [];
      return {
        routeIndex,
        points: pointResults,
        totalPoints: pointResults.length,
        successfulFetches: pointResults.filter((p) => p.aqi !== null).length,
      };
    });

    return results;
  } catch (error) {
    console.error("Error in computeAQI:", error);
    throw error;
  }
}
