# BreathClean Backend Architecture & Data Flow

This document outlines the backend architecture, scoring logic, data storage strategy, and caching mechanisms used in the BreathClean server. It is designed to serve as a reference for future integrations, specifically for the AI-driven periodic update system (Cron Jobs).

## 1. System Overview

The backend is responsible for:

1.  **Computing Route Scores**: Fetching real-time environmental data (AQI, Weather, Traffic) and calculating a "health score" for requested routes.
2.  **Caching**: Temporarily storing computation results to optimize performance and reduce API costs.
3.  **Persistence**: Saving selected routes and their specific "monitoring points" (Breakpoints) to MongoDB for long-term tracking.

## 2. Route Scoring Engine (`/api/v1/score/compute`)

When a user requests route data, the following pipeline is executed:

### A. Breakpoint Computation

- **Input**: Route geometry (line string of coordinates) from Mapbox.
- **Logic**: The route is analyzed to extract a set of representative points ("Breakpoints") based on distance.
  - < 100km: ~3 points
  - 100-500km: ~3-4 points
  - Points are distributed evenly to represent different segments of the journey.
- **Purpose**: These points serve as the "sensors" for fetching environmental data.

### B. Data Fetching & Scoring

For each breakpoint, we fetch:

1.  **Weather**: Temperature, Humidity, Pressure.
    - _Score_: Weighted average based on deviation from optimal conditions (e.g., 21°C, 50% humidity).
2.  **AQI (Air Quality)**: PM2.5, PM10, O3, NO2, etc.
    - _Score_: Inverse scale (Lower AQI = Higher Score). 0-20 is 100%, >200 is near 0%.
3.  **Traffic**: derived from duration difference.
    - _Score_: Non-linear penalty for traffic congestion.

**Final Score Formula**:
`Overall = (Weather * 0.4) + (AQI * 0.3) + (Traffic * 0.3)`

### C. Caching Strategy (Redis)

To optimize the "Save Route" flow, we cache the **Breakpoints** only.

- **Key**: `route_search:{UUID}` (e.g., `route_search:550e8400-e29b...`)
- **Value**: `{ breakpoints: [{lat, lon}, ...], timestamp: "..." }`
- **TTL**: 1 Hour.
- **Why**: We only store coordinates because environmental data (AQI/Weather) is volatile and should be re-fetched, but the _locations_ of the monitoring points for a specific route geometry remain constant.

---

## 3. Data Persistence (`/api/v1/saved-routes`)

When a user saves a route, we persist two types of documents in MongoDB.

### A. The Parent `Route` Document

Stores the high-level route metadata.

- **Collection**: `routes`
- **Key Fields**:
  - `userId`: Owner of the route.
  - `from` / `to`: Addresses and start/end coordinates.
  - `routes`: Array of route options (distance, duration, geometry).
    - _Note_: The `routes` array in this document stores the _geometry_, which allows us to re-render the path on the map.

### B. The `BreakPoint` Documents

Stores the specific locations we monitor for this route.

- **Collection**: `breakpoints`
- **Key Fields**:
  - `routeId`: Reference to the parent `Route` document.
  - `routeOptionIndex`: Which path this point belongs to (e.g., Route A vs Route B).
  - `pointIndex`: Sequence number (0, 1, 2...).
  - `location`: GeoJSON object `{ type: "Point", coordinates: [lon, lat] }`.

**Creation Logic**:

1.  The backend receives a `searchId` from the frontend.
2.  It attempts to fetch the cached breakpoints from **Redis**.
3.  **Cache Hit**: It uses the cached coordinates to create `BreakPoint` documents.
4.  **Cache Miss**: It falls back to the `computeBreakpoints` utility to re-calculate the points from the route geometry, ensuring no data loss.

---

## 4. Future Integration: AI & Cron Jobs

This architecture is designed for the upcoming periodic update system.

**The Workflow:**

1.  **Cron Job Trigger**: A scheduled task runs (e.g., hourly).
2.  **Fetch Targets**: The system queries the `routes` collection for active/favorite routes.
3.  **Retrieve Monitoring Points**:
    - For each route, the system queries the `breakpoints` collection: `BreakPoint.find({ routeId: route._id })`.
    - This returns an exact list of `{ lat, lon }` coordinates that define that route's health.
4.  **Batch Processing (Pathway AI)**:
    - These coordinates are sent to the AI/External Library.
    - The library fetches fresh AQI/Weather data for these specific points.
    - It computes new scores.
5.  **Update**:
    - The system updates the `Route` document with the new `lastComputedScore` and `lastComputedAt`.
    - Optionally, historical data can be stored in a separate time-series collection.

**Why this structure?**
By decoupling the _locations_ (Breakpoints) from the _environmental data_, we ensure that our Cron Job is efficient. It doesn't need to re-analyze geometry or guess where to check for pollution. It simply looks up the invariant "monitoring points" stored in the `BreakPoint` collection and polls them.
