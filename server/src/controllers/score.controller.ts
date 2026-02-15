import type { Request, Response } from "express";

import { computeBreakpoints } from "../utils/compute/breakPoint.compute.js";
import {
  computeWeather,
  type RouteWeatherResult,
} from "../utils/compute/weather.compute.js";

// Type definitions for the request
interface RouteGeometry {
  type: string;
  coordinates: [number, number][];
}

interface RouteData {
  distance: number;
  duration: number;
  routeGeometry: RouteGeometry;
  lastComputedScore?: number;
  lastComputedAt?: string;
  travelMode: string;
}

interface ScoreRequestBody {
  routes: RouteData[];
  traffic?: number[]; // Traffic score for each route (optional)
}

interface WeatherScore {
  temperature: number; // 0-100 (optimal: 15-25°C)
  humidity: number; // 0-100 (optimal: 30-60%)
  pressure: number; // 0-100 (optimal: 1010-1020 hPa)
  overall: number; // Average of all weather metrics
}

interface RouteScore {
  routeIndex: number;
  distance: number;
  duration: number;
  travelMode: string;
  breakpointCount: number;
  weatherScore: WeatherScore;
  trafficScore: number;
  overallScore: number; // Weighted combination of weather and traffic
  lastComputedScore?: number | undefined;
  scoreChange?: number | undefined; // Difference from last computed score
}

/**
 * Calculate weather score based on temperature
 * Optimal range: 15-25°C
 */
function calculateTemperatureScore(temp: number): number {
  const optimal = 20; // Optimal temperature
  const range = 10; // Acceptable range
  const diff = Math.abs(temp - optimal);

  if (diff <= range) {
    return 100 - (diff / range) * 30; // 70-100 for optimal range
  } else {
    const extraDiff = diff - range;
    return Math.max(0, 70 - extraDiff * 2); // Decrease rapidly outside range
  }
}

/**
 * Calculate weather score based on humidity
 * Optimal range: 30-60%
 */
function calculateHumidityScore(humidity: number): number {
  if (humidity >= 30 && humidity <= 60) {
    return 100; // Optimal range
  } else if (humidity < 30) {
    return Math.max(0, 100 - (30 - humidity) * 2); // Too dry
  } else {
    return Math.max(0, 100 - (humidity - 60) * 1.5); // Too humid
  }
}

/**
 * Calculate weather score based on pressure
 * Optimal range: 1010-1020 hPa
 */
function calculatePressureScore(pressure: number): number {
  const optimal = 1015; // Optimal pressure
  const range = 5; // Acceptable range
  const diff = Math.abs(pressure - optimal);

  if (diff <= range) {
    return 100;
  } else {
    return Math.max(0, 100 - (diff - range) * 3);
  }
}

/**
 * Calculate overall weather score for a route
 */
function calculateWeatherScore(weatherData: RouteWeatherResult): WeatherScore {
  let totalTemp = 0;
  let totalHumidity = 0;
  let totalPressure = 0;
  let validPoints = 0;

  // Aggregate weather data from all points
  for (const point of weatherData.points) {
    if (point.main) {
      const main = point.main;
      totalTemp += calculateTemperatureScore(main.temp);
      totalHumidity += calculateHumidityScore(main.humidity);
      totalPressure += calculatePressureScore(main.pressure);
      validPoints++;
    }
  }

  // Calculate averages
  const tempScore = validPoints > 0 ? totalTemp / validPoints : 0;
  const humidityScore = validPoints > 0 ? totalHumidity / validPoints : 0;
  const pressureScore = validPoints > 0 ? totalPressure / validPoints : 0;

  // Overall weather score (weighted average)
  const overall = tempScore * 0.4 + humidityScore * 0.35 + pressureScore * 0.25;

  return {
    temperature: Math.round(tempScore * 10) / 10,
    humidity: Math.round(humidityScore * 10) / 10,
    pressure: Math.round(pressureScore * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  };
}

/**
 * Calculate traffic score (normalize to 0-100 scale)
 * Lower traffic value = better score
 */
function calculateTrafficScore(trafficValue: number): number {
  // Assuming traffic value ranges from 0 (no traffic) to 3 (heavy traffic)
  // Convert to 0-100 scale (inverted)
  const normalized = Math.max(0, Math.min(3, trafficValue));
  return Math.round((1 - normalized / 3) * 100 * 10) / 10;
}

/**
 * Main controller for computing route scores
 * Pipeline: Route Data → Breakpoints → Weather → Score
 */
export const getScoreController = async (req: Request, res: Response) => {
  try {
    const { routes, traffic = [] }: ScoreRequestBody = req.body;

    // Validation
    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      res.status(400).json({
        success: false,
        message:
          "Invalid request. 'routes' array is required and cannot be empty.",
      });
      return;
    }

    if (routes.length > 3) {
      res.status(400).json({
        success: false,
        message: "Maximum 3 routes allowed.",
      });
      return;
    }

    // Validate route data
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (
        !route ||
        route.distance == null ||
        route.duration == null ||
        !route.routeGeometry
      ) {
        res.status(400).json({
          success: false,
          message: `Invalid route data at index ${i}. Missing required fields.`,
        });
        return;
      }
    }

    console.log(`Processing ${routes.length} routes for score computation...`);

    // Step 1: Extract breakpoints from route geometry
    console.log("Step 1: Extracting breakpoints...");
    const breakpoints = computeBreakpoints(routes);
    console.log(`Extracted breakpoints for ${breakpoints.length} routes`);

    // Step 2: Fetch weather data for all breakpoints
    console.log("Step 2: Fetching weather data...");
    const weatherData = await computeWeather(breakpoints);
    console.log(`Fetched weather data for ${weatherData.length} routes`);

    // Step 3: Calculate scores for each route
    console.log("Step 3: Calculating scores...");
    const routeScores: RouteScore[] = routes.map((route, index) => {
      const routeWeather = weatherData[index];
      if (!routeWeather) {
        throw new Error(`Weather data missing for route ${index}`);
      }

      const trafficValue = traffic[index] || 0;

      // Calculate individual scores
      const weatherScore = calculateWeatherScore(routeWeather);
      const trafficScore = calculateTrafficScore(trafficValue);

      // Calculate overall score (weighted combination)
      // Weather: 60%, Traffic: 40%
      const overallScore =
        Math.round((weatherScore.overall * 0.6 + trafficScore * 0.4) * 10) / 10;

      // Calculate score change if previous score exists
      let scoreChange: number | undefined = undefined;
      if (route.lastComputedScore !== undefined) {
        scoreChange =
          Math.round((overallScore - route.lastComputedScore) * 10) / 10;
      }

      return {
        routeIndex: index,
        distance: route.distance,
        duration: route.duration,
        travelMode: route.travelMode,
        breakpointCount: routeWeather.totalPoints,
        weatherScore,
        trafficScore,
        overallScore,
        lastComputedScore: route.lastComputedScore,
        scoreChange,
      };
    });

    // Find the best route (highest overall score)
    const bestRoute = routeScores.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );

    console.log("Score computation completed successfully!");

    res.json({
      success: true,
      message: "Route scores computed successfully",
      data: {
        routes: routeScores,
        bestRoute: {
          index: bestRoute.routeIndex,
          score: bestRoute.overallScore,
        },
        summary: {
          totalRoutes: routes.length,
          averageScore:
            Math.round(
              (routeScores.reduce((sum, r) => sum + r.overallScore, 0) /
                routes.length) *
                10
            ) / 10,
          scoreRange: {
            min: Math.min(...routeScores.map((r) => r.overallScore)),
            max: Math.max(...routeScores.map((r) => r.overallScore)),
          },
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getScoreController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to compute route scores",
    });
  }
};
