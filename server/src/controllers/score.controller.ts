import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
  computeAQI,
  type RouteAQIResult,
} from "../utils/compute/aqi.compute.js";
import { computeBreakpoints } from "../utils/compute/breakPoint.compute.js";
import {
  computeWeather,
  type RouteWeatherResult,
} from "../utils/compute/weather.compute.js";
import redis from "../utils/redis.js";

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

interface AQIScore {
  aqi: number; // Raw AQI value
  score: number; // 0-100 (lower AQI = better score)
  category: string; // Good, Moderate, Unhealthy, etc.
}

interface RouteScore {
  routeIndex: number;
  distance: number;
  duration: number;
  travelMode: string;
  breakpointCount: number;
  weatherScore: WeatherScore;
  weatherDetails?:
    | {
        avgTemp: number;
        avgHumidity: number;
        avgPressure: number;
      }
    | undefined;
  aqiScore: AQIScore;
  aqiDetails?:
    | {
        dominentpol?: string | undefined;
        pollutants?:
          | {
              pm25?: number | undefined;
              pm10?: number | undefined;
              o3?: number | undefined;
              no2?: number | undefined;
              so2?: number | undefined;
              co?: number | undefined;
            }
          | undefined;
      }
    | undefined;
  trafficScore: number;
  overallScore: number; // Weighted combination of weather, AQI, and traffic
  lastComputedScore?: number | undefined;
  scoreChange?: number | undefined; // Difference from last computed score
}

/**
 * Calculate weather score based on temperature
 * Optimal: 21°C
 * Stricter curve: Deviating by 5°C drops score to ~70
 */
function calculateTemperatureScore(temp: number): number {
  const optimal = 21;
  const diff = Math.abs(temp - optimal);

  // Perfect range: +/- 1°C
  if (diff <= 1) return 100;

  // Stricter penalty: loss of 6 points per degree deviation
  // Example: 26°C (diff 5) -> 100 - (5 * 6) = 70
  // Example: 31°C (diff 10) -> 100 - (10 * 6) = 40
  return Math.max(0, 100 - diff * 6);
}

/**
 * Calculate weather score based on humidity
 * Optimal: 50%
 * Stricter curve: +/- 5% is optimal
 */
function calculateHumidityScore(humidity: number): number {
  // Perfect range: 45-55%
  if (humidity >= 45 && humidity <= 55) return 100;

  const ideal = 50;
  const diff = Math.abs(humidity - ideal);

  // Penalty: loss of 1.5 points per percent deviation outside optimal
  return Math.max(0, 100 - (diff - 5) * 2);
}

/**
 * Calculate weather score based on pressure
 * Optimal: 1013 hPa
 */
function calculatePressureScore(pressure: number): number {
  const optimal = 1013;
  const diff = Math.abs(pressure - optimal);

  if (diff <= 2) return 100;
  return Math.max(0, 100 - (diff - 2) * 4);
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
  // Temperature is most perceptible to humans, so higher weight
  const overall = tempScore * 0.5 + humidityScore * 0.3 + pressureScore * 0.2;

  return {
    temperature: Math.round(tempScore * 10) / 10,
    humidity: Math.round(humidityScore * 10) / 10,
    pressure: Math.round(pressureScore * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  };
}

/**
 * Calculate AQI score based on Air Quality Index
 * AQI Scale (Stricter):
 * 0-20: Excellent (100)
 * 21-50: Good (100 -> 80 gradient)
 * 51-100: Moderate (80 -> 50 gradient)
 * 101-150: Unhealthy for Sensitive (50 -> 30)
 * 151+: Unhealthy (30 -> 0)
 */
function calculateAQIScore(aqiData: RouteAQIResult): AQIScore {
  let totalAQI = 0;
  let validPoints = 0;

  // Aggregate AQI data from all points
  for (const point of aqiData.points) {
    if (point.aqi && point.aqi.aqi !== undefined) {
      // Validate AQI is a number
      const val = Number(point.aqi.aqi);
      if (!isNaN(val)) {
        totalAQI += val;
        validPoints++;
      }
    }
  }

  // CRITICAL FIX: If no valid data, do NOT default to 0 (which would score 100)
  if (validPoints === 0) {
    console.warn("⚠️ WARNING: No valid AQI data found! Defaulting to 0 score.");
    return {
      aqi: 0,
      score: 0, // Default to 0, not 100
      category: "Unknown - No Data",
    };
  }

  // Calculate average AQI
  const avgAQI = totalAQI / validPoints;

  // Calculate score based on AQI value (inverted - lower AQI is better)
  let score = 0;
  let category = "Unknown";

  if (avgAQI <= 20) {
    score = 100;
    category = "Excellent";
  } else if (avgAQI <= 50) {
    // Gradient 100 -> 80
    // Range size: 30 (50-20)
    // Score drop: 20 points
    score = 100 - ((avgAQI - 20) / 30) * 20;
    category = "Good";
  } else if (avgAQI <= 100) {
    // Gradient 80 -> 50
    // Range size: 50
    // Score drop: 30 points
    score = 80 - ((avgAQI - 50) / 50) * 30;
    category = "Moderate";
  } else if (avgAQI <= 150) {
    // Gradient 50 -> 30
    score = 50 - ((avgAQI - 100) / 50) * 20;
    category = "Unhealthy for Sensitive Groups";
  } else if (avgAQI <= 200) {
    // Gradient 30 -> 10
    score = 30 - ((avgAQI - 150) / 50) * 20;
    category = "Unhealthy";
  } else {
    // 200+ is basically 0
    // Drop from 10 to 0 between 200 and 300
    score = Math.max(0, 10 - ((avgAQI - 200) / 100) * 10);
    category = avgAQI <= 300 ? "Very Unhealthy" : "Hazardous";
  }

  return {
    aqi: Math.round(avgAQI * 10) / 10,
    score: Math.round(score * 10) / 10,
    category,
  };
}

/**
 * Calculate traffic score (normalize to 0-100 scale)
 * Lower traffic value = better score
 * Stricter: Sensitivity increased. Even light traffic penalizes score.
 */
function calculateTrafficScore(trafficValue: number): number {
  // trafficValue: 0 (clear) to 10 (severe)
  // Usually mapped from trafficFactor: (factor - 1) * 3 or similar
  // Let's assume input 0-3 range from request body logic

  if (trafficValue <= 0) return 100;

  // Non-linear penalty. Small traffic hurts, large traffic kills score.
  // 0.5 (light) -> 85
  // 1.0 (moderate) -> 65
  // 2.0 (heavy) -> 25
  // 3.0 (severe) -> 0

  // Power curve to maintain high score only for VERY clear roads
  const normalized = Math.min(trafficValue / 3, 1); // 0 to 1
  const penalty = Math.pow(normalized, 0.7); // Convex curve

  const score = Math.round((1 - penalty) * 100 * 10) / 10;

  return score;
}

/**
 * Main controller for computing route scores
 * Pipeline: Route Data → Breakpoints → Weather → AQI → Score
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

    // Step 1: Extract breakpoints from route geometry
    const breakpoints = computeBreakpoints(routes);

    // Step 2: Fetch weather data for all breakpoints
    const weatherData = await computeWeather(breakpoints);

    // Step 3: Fetch AQI data for all breakpoints
    const aqiData = await computeAQI(breakpoints);

    // Step 4: Calculate scores for each route
    const routeScores: RouteScore[] = routes.map((route, index) => {
      const routeWeather = weatherData[index];
      if (!routeWeather) {
        throw new Error(`Weather data missing for route ${index}`);
      }

      const routeAQI =
        aqiData[index] ??
        ({
          routeIndex: index,
          points: [],
          totalPoints: 0,
          successfulFetches: 0,
        } as RouteAQIResult);
      if (!aqiData[index]) {
        console.warn(`AQI data missing for route ${index}. Using fallback.`);
      }

      const aqiScore = calculateAQIScore(routeAQI);

      const trafficValue = traffic[index] || 0;

      // Calculate individual scores
      const weatherScore = calculateWeatherScore(routeWeather);
      const trafficScore = calculateTrafficScore(trafficValue);

      // Extract detailed weather data
      let avgTemp = 0;
      let avgHumidity = 0;
      let avgPressure = 0;
      let validWeatherPoints = 0;

      for (const point of routeWeather.points) {
        if (point.main) {
          avgTemp += point.main.temp;
          avgHumidity += point.main.humidity;
          avgPressure += point.main.pressure;
          validWeatherPoints++;
        }
      }

      const weatherDetails =
        validWeatherPoints > 0
          ? {
              avgTemp: Math.round((avgTemp / validWeatherPoints) * 10) / 10,
              avgHumidity:
                Math.round((avgHumidity / validWeatherPoints) * 10) / 10,
              avgPressure:
                Math.round((avgPressure / validWeatherPoints) * 10) / 10,
            }
          : undefined;

      // Extract detailed AQI data (pollutants)
      let pm25Total = 0,
        pm10Total = 0,
        o3Total = 0;
      let no2Total = 0,
        so2Total = 0,
        coTotal = 0;
      let pm25Count = 0,
        pm10Count = 0,
        o3Count = 0;
      let no2Count = 0,
        so2Count = 0,
        coCount = 0;
      let dominentpol: string | undefined = undefined;

      for (const point of routeAQI.points) {
        if (point.aqi) {
          if (point.aqi.dominentpol) dominentpol = point.aqi.dominentpol;
          if (point.aqi.iaqi?.pm25) {
            pm25Total += point.aqi.iaqi.pm25.v;
            pm25Count++;
          }
          if (point.aqi.iaqi?.pm10) {
            pm10Total += point.aqi.iaqi.pm10.v;
            pm10Count++;
          }
          if (point.aqi.iaqi?.o3) {
            o3Total += point.aqi.iaqi.o3.v;
            o3Count++;
          }
          if (point.aqi.iaqi?.no2) {
            no2Total += point.aqi.iaqi.no2.v;
            no2Count++;
          }
          if (point.aqi.iaqi?.so2) {
            so2Total += point.aqi.iaqi.so2.v;
            so2Count++;
          }
          if (point.aqi.iaqi?.co) {
            coTotal += point.aqi.iaqi.co.v;
            coCount++;
          }
        }
      }

      const aqiDetails = {
        dominentpol,
        pollutants: {
          pm25:
            pm25Count > 0
              ? Math.round((pm25Total / pm25Count) * 10) / 10
              : undefined,
          pm10:
            pm10Count > 0
              ? Math.round((pm10Total / pm10Count) * 10) / 10
              : undefined,
          o3:
            o3Count > 0 ? Math.round((o3Total / o3Count) * 10) / 10 : undefined,
          no2:
            no2Count > 0
              ? Math.round((no2Total / no2Count) * 10) / 10
              : undefined,
          so2:
            so2Count > 0
              ? Math.round((so2Total / so2Count) * 10) / 10
              : undefined,
          co:
            coCount > 0 ? Math.round((coTotal / coCount) * 10) / 10 : undefined,
        },
      };

      // Calculate overall score (weighted combination)
      // Weather: 40%, AQI: 30%, Traffic: 30%
      const overallScore =
        Math.round(
          (weatherScore.overall * 0.4 +
            aqiScore.score * 0.3 +
            trafficScore * 0.3) *
            10
        ) / 10;

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
        weatherDetails,
        aqiScore,
        aqiDetails,
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

    // --- REDIS CACHING START ---
    const searchId = uuidv4();
    try {
      // Store ONLY raw breakpoints (to save locations later)
      // TTL: 3600 seconds (1 hour)
      await redis.set(
        `route_search:${searchId}`,
        JSON.stringify({
          breakpoints,
          timestamp: new Date().toISOString(),
        }),
        { ex: 3600 }
      );
    } catch (redisError) {
      console.error("Redis caching failed (continuing anyway):", redisError);
    }
    // --- REDIS CACHING END ---

    res.json({
      success: true,
      message: "Route scores computed successfully",
      searchId, // <--- Return this to client
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
