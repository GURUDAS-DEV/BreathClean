/**
 * Pathway Client
 *
 * Communicates with the Django/Pathway data processing server
 * to compute route health scores.
 */

// Input format expected by Pathway endpoint
export interface PathwayRouteInput {
  routeId?: string;
  routeIndex: number;
  distance: number;
  duration: number;
  travelMode: string;
  weatherPoints: Array<{
    main: {
      temp?: number;
      humidity?: number;
      pressure?: number;
      feels_like?: number;
      temp_min?: number;
      temp_max?: number;
    } | null;
  }>;
  aqiPoints: Array<{
    aqi: {
      aqi?: number;
      dominentpol?: string | undefined;
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
      };
    } | null;
  }>;
  trafficValue: number;
  lastComputedScore?: number;
}

// Output format from Pathway endpoint
export interface PathwayRouteOutput {
  routeIndex: number;
  routeId?: string;
  distance: number;
  duration: number;
  travelMode: string;
  breakpointCount: number;
  weatherScore: {
    temperature: number;
    humidity: number;
    pressure: number;
    overall: number;
  };
  weatherDetails?: {
    avgTemp: number;
    avgHumidity: number;
    avgPressure: number;
  };
  aqiScore: {
    aqi: number;
    score: number;
    category: string;
  };
  aqiDetails?: {
    dominentpol?: string;
    pollutants?: {
      pm25?: number;
      pm10?: number;
      o3?: number;
      no2?: number;
      so2?: number;
      co?: number;
    };
  };
  trafficScore: number;
  overallScore: number;
  lastComputedScore?: number;
  scoreChange?: number;
  computedAt: string;
}

export interface PathwayResponse {
  success: boolean;
  message: string;
  routes?: PathwayRouteOutput[];
  bestRoute?: {
    index: number;
    routeId?: string;
    score: number;
  };
  summary?: {
    totalRoutes: number;
    averageScore: number;
    scoreRange: {
      min: number;
      max: number;
    };
  };
  computedAt?: string;
  engine?: string;
}

/**
 * Send routes to Pathway for score computation
 *
 * @param baseUrl - Base URL of the Pathway server (e.g., "http://localhost:8001")
 * @param routes - Array of route data with pre-fetched weather/AQI
 * @returns Pathway response with computed scores
 */
export async function sendToPathway(
  baseUrl: string,
  routes: PathwayRouteInput[]
): Promise<PathwayResponse> {
  const url = `${baseUrl}/api/compute-scores/`;
  const timeout = 30000; // 30 second timeout

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  console.log(`[PathwayClient] POST ${url} (timeout: ${timeout}ms)`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ routes }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[PathwayClient] HTTP ${response.status} from ${url}: ${errorText}`
      );
      return {
        success: false,
        message: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as PathwayResponse;
    console.log(`[PathwayClient] Success from ${url}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(
          `[PathwayClient] Timed out after ${timeout}ms calling ${url}`
        );
        return { success: false, message: "Request timed out" };
      }
      const cause = (error as NodeJS.ErrnoException).cause;
      console.error(
        `[PathwayClient] Fetch failed for ${url} — ${error.message}`,
        cause instanceof Error
          ? {
              code: (cause as NodeJS.ErrnoException).code,
              cause: cause.message,
            }
          : cause
      );
      return { success: false, message: error.message };
    }
    console.error(`[PathwayClient] Unknown error calling ${url}:`, error);
    return { success: false, message: "Unknown error" };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Health check for Pathway server
 */
export async function checkPathwayHealth(baseUrl: string): Promise<boolean> {
  const url = `${baseUrl}/api/health/`;
  const timeout = 30000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    if (response.ok) {
      const data = await response.json();
      console.log(
        `[PathwayClient] Health check passed: ${JSON.stringify(data)}`
      );
      return true;
    }
    console.error(
      `[PathwayClient] Health check failed: HTTP ${response.status}`
    );
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[PathwayClient] Health check timed out");
    } else {
      console.error(`[PathwayClient] Health check error:`, error);
    }
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default {
  sendToPathway,
  checkPathwayHealth,
};
