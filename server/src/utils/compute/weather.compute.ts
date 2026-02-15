//
// Type definitions for better type safety
export interface Coordinate {
  lat: number;
  lon: number;
}

export interface RoutePoints {
  point_1?: Coordinate;
  point_2?: Coordinate;
  point_3?: Coordinate;
  point_4?: Coordinate;
  point_5?: Coordinate;
  point_6?: Coordinate;
  point_7?: Coordinate;
}

// Main weather data that we care about
export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

// Full weather API response (for internal use)
interface WeatherAPIResponse {
  main?: WeatherMain;
  coord?: { lon: number; lat: number };
  weather?: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind?: { speed: number; deg: number };
  clouds?: { all: number };
  dt?: number;
  name?: string;
}

export interface PointWeatherResult {
  point: string;
  coordinate: Coordinate;
  main: WeatherMain | null;
  error?: string;
}

export interface RouteWeatherResult {
  routeIndex: number;
  points: PointWeatherResult[];
  totalPoints: number;
  successfulFetches: number;
}

/**
 * Fetches weather data for a single coordinate point
 * Returns only the main weather object
 */
async function fetchWeatherForPoint(
  lat: number,
  lon: number
): Promise<WeatherMain | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      console.error(
        `Weather API error for (${lat}, ${lon}): ${response.status}`
      );
      return null;
    }

    const data = (await response.json()) as WeatherAPIResponse;

    // Return only the main object
    if (data.main) {
      return data.main;
    }

    console.error(`No main weather data for (${lat}, ${lon})`);
    return null;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`Weather API timeout for (${lat}, ${lon})`);
    } else {
      console.error(`Failed to fetch weather for (${lat}, ${lon}):`, error);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Computes weather data for multiple routes with multiple points
 *
 * @param routes - Array of route objects, each containing point_1, point_2, point_3, etc.
 * @returns Array of weather results for each route, with only main weather data
 */
export async function computeWeather(
  routes: RoutePoints[]
): Promise<RouteWeatherResult[]> {
  try {
    if (!routes || routes.length === 0) {
      throw new Error("No routes provided");
    }

    if (!process.env.WEATHER_API_KEY) {
      throw new Error("WEATHER_API_KEY not configured");
    }

    // Task definition for batching
    interface PointTask {
      routeIndex: number;
      pointKey: string;
      point: Coordinate;
    }

    // Step 1: Collect ALL points that need weather data from ALL routes
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
    const pointResultsMap = new Map<number, PointWeatherResult[]>();
    const CONCURRENCY_LIMIT = 5;

    for (let i = 0; i < allPointTasks.length; i += CONCURRENCY_LIMIT) {
      const batch = allPointTasks.slice(i, i + CONCURRENCY_LIMIT);

      // Execute this batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (task) => {
          const mainWeatherData = await fetchWeatherForPoint(
            task.point.lat,
            task.point.lon
          );

          const result: PointWeatherResult = {
            point: task.pointKey,
            coordinate: task.point,
            main: mainWeatherData,
          };

          if (mainWeatherData === null) {
            result.error = "Failed to fetch weather (timeout or API error)";
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

    // Step 3: Format the results back to the expected RouteWeatherResult[] structure
    const results: RouteWeatherResult[] = routes.map((_, routeIndex) => {
      const pointResults = pointResultsMap.get(routeIndex) || [];
      return {
        routeIndex,
        points: pointResults,
        totalPoints: pointResults.length,
        successfulFetches: pointResults.filter((p) => p.main !== null).length,
      };
    });

    console.log(
      `Weather computation complete: ${results.length} routes, ${results.reduce(
        (sum, r) => sum + r.totalPoints,
        0
      )} total points (Batched Concurrency Limit: ${CONCURRENCY_LIMIT})`
    );

    return results;
  } catch (error) {
    console.error("Error in computeWeather:", error);
    throw error;
  }
}
