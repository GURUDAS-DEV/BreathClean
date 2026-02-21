/**
 * Periodic Route Score Computation Scheduler
 *
 * This scheduler runs every 10-15 minutes and:
 * 1. Fetches all saved routes from MongoDB
 * 2. For each route, retrieves stored breakpoints
 * 3. Fetches fresh AQI/weather data for those breakpoints
 * 4. Sends data to Pathway for score computation
 * 5. Updates route documents with new scores
 *
 * Uses incremental per-route processing for:
 * - Memory efficiency
 * - Faster perceived progress (DB updated incrementally)
 * - Better error recovery (partial success possible)
 * - Rate-limit friendly pacing
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

// Configuration
const PATHWAY_URL = process.env.PATHWAY_URL || "http://localhost:8001";
const BATCH_SIZE = 5; // Number of routes to process in parallel
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "*/15 * * * *"; // Every 15 minutes

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

  // Sort by pointIndex and map to point_1, point_2, etc.
  const sorted = [...breakpoints].sort((a, b) => a.pointIndex - b.pointIndex);

  sorted.forEach((bp, index) => {
    const key = `point_${index + 1}` as keyof RoutePoints;
    // MongoDB stores as [lon, lat], convert to {lat, lon}
    routePoints[key] = {
      lat: bp.location.coordinates[1],
      lon: bp.location.coordinates[0],
    };
  });

  return routePoints;
}

/**
 * Process a single route: fetch data, compute score, update DB
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
    // Step 1: Fetch breakpoints for this route option from MongoDB
    const breakpoints = await BreakPoint.find({
      routeId,
      routeOptionIndex,
    }).sort({ pointIndex: 1 });

    if (breakpoints.length === 0) {
      console.warn(
        `[Scheduler] No breakpoints found for route ${routeId}, option ${routeOptionIndex}`
      );
      return {
        success: false,
        routeId,
        routeOptionIndex,
        error: "No breakpoints found",
      };
    }

    // Step 2: Convert to RoutePoints format
    const routePoints = breakpointsToRoutePoints(breakpoints);

    // Step 3: Fetch weather and AQI data in parallel
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

    // Step 4: Prepare data for Pathway
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
      trafficValue: 0, // TODO: Add traffic computation if needed
      ...(routeOption.lastComputedScore !== undefined
        ? { lastComputedScore: routeOption.lastComputedScore }
        : {}),
    };

    // Step 5: Send to Pathway for computation
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

    // Step 6: Update route in MongoDB
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
    console.error(`[Scheduler] Error processing route ${routeId}:`, error);
    return {
      success: false,
      routeId,
      routeOptionIndex,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main batch scoring job
 * Processes all routes incrementally
 */
export async function runBatchScoring(): Promise<void> {
  const startTime = Date.now();

  try {
    // Fetch all routes (or filter by criteria like isFavorite, etc.)
    const routes = await Route.find({}).lean();

    if (routes.length === 0) {
      return;
    }

    // Build list of all route options to process
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
        tasks.push({
          routeId: route._id.toString(),
          routeOptionIndex: index,
          routeOption: {
            distance: option.distance,
            duration: option.duration,
            travelMode: option.travelMode?.type || "driving",
            ...(option.lastComputedScore !== undefined &&
            option.lastComputedScore !== null
              ? { lastComputedScore: option.lastComputedScore }
              : {}),
          },
        });
      });
    }

    // Process in batches for controlled parallelism
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

      // Small delay between batches to be rate-limit friendly
      if (i + BATCH_SIZE < tasks.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (failed > 0) {
      const failures = results.filter((r) => !r.success);
      console.warn("[Scheduler] Failed routes:", failures);
    }

    console.info(
      `[Scheduler] Batch scoring completed: ${successful} succeeded, ${failed} failed in ${duration}s`
    );
  } catch (error) {
    console.error("[Scheduler] Critical error in batch scoring:", error);
  }
}

/**
 * Initialize the cron scheduler
 */
let _isRunning = false;

export function initScheduler(): void {
  cron.schedule(CRON_SCHEDULE, async () => {
    if (_isRunning) {
      console.info(
        "[Scheduler] Previous batch still running — skipping this tick"
      );
      return;
    }
    _isRunning = true;
    try {
      await runBatchScoring();
    } catch (error) {
      console.error("[Scheduler] Unhandled error in batch scoring:", error);
    } finally {
      _isRunning = false;
    }
  });
}

/**
 * Run batch scoring manually (for testing/debugging)
 */
export async function runManualBatchScoring(): Promise<void> {
  await runBatchScoring();
}

export default {
  initScheduler,
  runBatchScoring,
  runManualBatchScoring,
};
