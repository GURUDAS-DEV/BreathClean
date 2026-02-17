import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import savedRoutesRoutes from "./routes/savedRoutes.routes.js";
import scoreRoutes from "./routes/score.routes.js";
import connectDB from "./utils/connectDB.js";
import {
  initScheduler,
  runManualBatchScoring,
} from "./utils/scheduler/computeData.scheduler.js";
import { checkPathwayHealth } from "./utils/scheduler/pathwayClient.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://breathe.daemondoc.online"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/saved-routes", savedRoutesRoutes);
app.use("/api/v1/score", scoreRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});

// Manual trigger for batch scoring (for testing/debugging)
app.post("/api/v1/scheduler/run", async (_req, res) => {
  try {
    // Run asynchronously, don't wait
    runManualBatchScoring().catch(console.error);
    res.json({ message: "Batch scoring triggered", status: "running" });
  } catch (error) {
    res.status(500).json({ message: "Failed to trigger batch scoring", error });
  }
});

// Health check for Pathway server
app.get("/api/v1/scheduler/pathway-health", async (_req, res) => {
  const pathwayUrl = process.env.PATHWAY_URL || "http://localhost:8001";
  const isHealthy = await checkPathwayHealth(pathwayUrl);
  res.json({
    pathway: isHealthy ? "healthy" : "unhealthy",
    url: pathwayUrl,
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Initialize the cron scheduler after server starts
      if (process.env.ENABLE_SCHEDULER !== "false") {
        initScheduler();
        console.log("Batch scoring scheduler initialized");
      } else {
        console.log("Scheduler disabled (ENABLE_SCHEDULER=false)");
      }
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

export default app;
