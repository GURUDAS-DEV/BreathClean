/**
 * Periodic Route Score Computation Scheduler
 *
 * Runs on a cron schedule and:
 * 1. Fetches all saved routes from MongoDB
 * 2. For each route, retrieves stored breakpoints
 * 3. Fetches fresh AQI/weather data for those breakpoints
 * 4. Sends data to Pathway for score computation
 * 5. Updates route documents with new scores
 */
import cron from "node-cron";

import BreakPoint from "../../Schema/breakPoints.js";
import Route from "../../Schema/route.schema.js";
import { computeAQI } from "../compute/aqi.compute.js";
import {
  computeWeather,
  type RoutePoints,
} from "../compute/weather.compute.js";
import { type PathwayRouteInput, sendToPathway } from "./pathwayClient.js";

// ─── Configuration ────────────────────────────────────────────────────────────
const PATHWAY_URL = process.env.PATHWAY_URL || "http://localhost:8001";
const BATCH_SIZE = 5;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "*/30 * * * *";

// ─── Schema note ──────────────────────────────────────────────────────────────
// routeOptionSchema stores travelMode as a plain String in MongoDB.
// When using .lean(), the value is a raw string — not an ITravelMode object.
// We cast through unknown to read it correctly.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert stored breakpoints to RoutePoints format expected by compute utilities
 */
function breakpointsToRoutePoints(
  breakpoints: Array<{
    pointIndex: number;
    location: { coordinates: [number, number] };
  }>
): RoutePoints {
  const routePoints: RoutePoints = {};
  const sorted = [...breakpoints].sort((a, b) => a.pointIndex - b.pointIndex);

  sorted.forEach((bp, index) => {
    const key = `point_${index + 1}` as keyof RoutePoints;
    // MongoDB stores [lon, lat] — convert to { lat, lon }
    routePoints[key] = {
      lat: bp.location.coordinates[1],
      lon: bp.location.coordinates[0],
    };
  });

  return routePoints;
}

/**
 * Process a single route option: fetch environmental data, compute score, persist to DB
 */
async function processRoute(
  routeId: string,
  routeOptionIndex: number,
  routeOption: {
    distance: number;
    duration: number;
    travelMode: string;
    lastComputedScore?: number;
  }
): Promise<{
  success: boolean;
  routeId: string;
  routeOptionIndex: number;
  newScore?: number;
  error?: string;
}> {
  try {
    // Step 1: Fetch breakpoints for this route option
    const breakpoints = await BreakPoint.find({
      routeId,
      routeOptionIndex,
    }).sort({ pointIndex: 1 });

    if (breakpoints.length === 0) {
      return {
        success: false,
        routeId,
        routeOptionIndex,
        error: "No breakpoints found",
      };
    }

    // Step 2: Convert breakpoints → RoutePoints
    const routePoints = breakpointsToRoutePoints(breakpoints);

    // Step 3: Fetch Weather & AQI in parallel
    const [weatherResults, aqiResults] = await Promise.all([
      computeWeather([routePoints]),
      computeAQI([routePoints]),
    ]);

    const weatherData = weatherResults[0];
    const aqiData = aqiResults[0];

    if (!weatherData || !aqiData) {
      return {
        success: false,
        routeId,
        routeOptionIndex,
        error: "Failed to fetch environmental data",
      };
    }

    // Step 4: Build Pathway payload
    // travelMode is a plain String from MongoDB lean() — pass directly
    const pathwayInput: PathwayRouteInput = {
      routeId,
      routeIndex: routeOptionIndex,
      distance: routeOption.distance,
      duration: routeOption.duration,
      travelMode: routeOption.travelMode,
      weatherPoints: weatherData.points.map((p) => ({ main: p.main })),
      aqiPoints: aqiData.points.map((p) => ({
        aqi: p.aqi,
      })) as PathwayRouteInput["aqiPoints"],
      trafficValue: 0,
      ...(routeOption.lastComputedScore !== undefined
        ? { lastComputedScore: routeOption.lastComputedScore }
        : {}),
    };

    // Step 5: Send to Pathway
    const pathwayResult = await sendToPathway(PATHWAY_URL, [pathwayInput]);

    if (!pathwayResult.success || !pathwayResult.routes?.[0]) {
      return {
        success: false,
        routeId,
        routeOptionIndex,
        error: pathwayResult.message || "Pathway computation failed",
      };
    }

    const computedScore = pathwayResult.routes[0];

    // Step 6: Persist score to MongoDB
    await Route.updateOne(
      { _id: routeId },
      {
        $set: {
          [`routes.${routeOptionIndex}.lastComputedScore`]:
            computedScore.overallScore,
          [`routes.${routeOptionIndex}.lastComputedAt`]: new Date(),
        },
      }
    );

    return {
      success: true,
      routeId,
      routeOptionIndex,
      newScore: computedScore.overallScore,
    };
  } catch (error) {
    return {
      success: false,
      routeId,
      routeOptionIndex,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main batch scoring job — fetches all routes and recomputes scores
 */
export async function runBatchScoring(): Promise<void> {
  try {
    const routes = await Route.find({}).lean();

    if (routes.length === 0) {
      return;
    }

    // Build flat list of all route-options to process
    const tasks: Array<{
      routeId: string;
      routeOptionIndex: number;
      routeOption: {
        distance: number;
        duration: number;
        travelMode: string;
        lastComputedScore?: number;
      };
    }> = [];

    for (const route of routes) {
      route.routes.forEach((option, index) => {
        // travelMode is stored as a plain String in MongoDB (routeOptionSchema: type: String)
        const rawTravelMode = (option as unknown as { travelMode: string })
          .travelMode;

        tasks.push({
          routeId: route._id.toString(),
          routeOptionIndex: index,
          routeOption: {
            distance: option.distance,
            duration: option.duration,
            travelMode: rawTravelMode || "driving",
            ...(option.lastComputedScore !== undefined &&
            option.lastComputedScore !== null
              ? { lastComputedScore: option.lastComputedScore }
              : {}),
          },
        });
      });
    }

    // Process in controlled batches
    const results: Array<{
      success: boolean;
      routeId: string;
      routeOptionIndex: number;
      newScore?: number;
      error?: string;
    }> = [];

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map((task) =>
          processRoute(task.routeId, task.routeOptionIndex, task.routeOption)
        )
      );

      results.push(...batchResults);

      // Rate-limit friendly delay between batches
      if (i + BATCH_SIZE < tasks.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } catch {
    // silent — errors are captured per-route
  }
}

/**
 * Initialize the cron scheduler
 */
let _isRunning = false;

export function initScheduler(): void {
  cron.schedule(CRON_SCHEDULE, async () => {
    if (_isRunning) {
      return; // skip — previous batch still in progress
    }
    _isRunning = true;
    try {
      await runBatchScoring();
    } catch {
      // silent
    } finally {
      _isRunning = false;
    }
  });
}

/**
 * Run batch scoring manually (admin endpoint / startup trigger)
 */
export async function runManualBatchScoring(): Promise<void> {
  await runBatchScoring();
}

export default {
  initScheduler,
  runBatchScoring,
  runManualBatchScoring,
};
