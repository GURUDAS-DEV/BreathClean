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
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
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
  } catch (error) {
    console.error(`Failed to fetch weather for (${lat}, ${lon}):`, error);
    return null;
  }
}

/**
 * Computes weather data for multiple routes with multiple points
 *
 * @param routes - Array of route objects, each containing point_1, point_2, point_3, etc.
 * @returns Array of weather results for each route, with only main weather data
 *
 * @example
 * const routes = [
 *   { point_1: { lat: 28.7041, lon: 77.1025 }, point_2: { lat: 28.5355, lon: 77.3910 } },
 *   { point_1: { lat: 28.6139, lon: 77.2090 } }
 * ];
 * const weatherData = await computeWeather(routes);
 *
 * // Returns:
 * [
 *   {
 *     routeIndex: 0,
 *     points: [
 *       {
 *         point: "point_1",
 *         coordinate: { lat: 28.7041, lon: 77.1025 },
 *         main: { temp: 25, feels_like: 24, temp_min: 23, temp_max: 27, pressure: 1013, humidity: 60 }
 *       },
 *       ...
 *     ],
 *     totalPoints: 2,
 *     successfulFetches: 2
 *   }
 * ]
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

    // Collect all weather fetch promises for parallel execution
    const routePromises = routes.map(async (route, routeIndex) => {
      const pointPromises: Promise<PointWeatherResult>[] = [];

      // Iterate through all possible points (point_1 to point_7)
      for (let i = 1; i <= 7; i++) {
        const pointKey = `point_${i}` as keyof RoutePoints;
        const point = route[pointKey];

        if (point && point.lat !== undefined && point.lon !== undefined) {
          // Create a promise for each point's weather data
          const pointPromise = fetchWeatherForPoint(point.lat, point.lon).then(
            (mainWeatherData): PointWeatherResult => {
              const result: PointWeatherResult = {
                point: pointKey,
                coordinate: point,
                main: mainWeatherData,
              };
              if (mainWeatherData === null) {
                result.error = "Failed to fetch weather";
              }
              return result;
            }
          );
          pointPromises.push(pointPromise);
        }
      }

      // Wait for all points in this route to complete
      const pointResults = await Promise.all(pointPromises);

      return {
        routeIndex,
        points: pointResults,
        totalPoints: pointResults.length,
        successfulFetches: pointResults.filter((p) => p.main !== null).length,
      };
    });

    // Execute all route fetches in parallel
    const results = await Promise.all(routePromises);

    console.log(
      `Weather computation complete: ${results.length} routes, ${results.reduce(
        (sum, r) => sum + r.totalPoints,
        0
      )} total points`
    );

    return results;
  } catch (error) {
    console.error("Error in computeWeather:", error);
    throw error;
  }
}
