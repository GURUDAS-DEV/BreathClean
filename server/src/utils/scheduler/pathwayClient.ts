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
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}/api/compute-scores/`;
  const timeout = process.env.PATHWAY_TIMEOUT_MS
    ? parseInt(process.env.PATHWAY_TIMEOUT_MS, 10)
    : 90000;
  const retryCount = process.env.PATHWAY_RETRY_COUNT
    ? parseInt(process.env.PATHWAY_RETRY_COUNT, 10)
    : 1;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ routes, usePathway: false }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[PathwayClient] HTTP error ${response.status} (attempt ${attempt + 1}/${retryCount + 1}): ${errorText}`
        );

        if (response.status >= 500 && attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        return {
          success: false,
          message: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as PathwayResponse;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error(
            `[PathwayClient] Request timed out after ${timeout}ms (attempt ${attempt + 1}/${retryCount + 1})`
          );
          if (attempt < retryCount) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          return {
            success: false,
            message: "Request timed out",
          };
        }

        console.error(`[PathwayClient] Error: ${error.message}`);
        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Unknown error",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    success: false,
    message: "Request failed after retries",
  };
}

/**
 * Health check for Pathway server
 */
export async function checkPathwayHealth(baseUrl: string): Promise<boolean> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}/api/health/`;
  const timeout = process.env.PATHWAY_TIMEOUT_MS
    ? parseInt(process.env.PATHWAY_TIMEOUT_MS, 10)
    : 30000;

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
