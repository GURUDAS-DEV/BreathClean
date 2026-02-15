# Testing the AQI Integration

## Quick Test Guide

### 1. Start the Server

```bash
cd server
npm run dev
```

### 2. Test API Request

Use this sample request to test the AQI integration:

```bash
curl -X POST http://localhost:8000/api/v1/score/compute \
  -H "Content-Type: application/json" \
  -d '{
    "routes": [
      {
        "distance": 5000,
        "duration": 600,
        "travelMode": "driving",
        "routeGeometry": {
          "type": "LineString",
          "coordinates": [
            [77.5946, 12.9716],
            [77.6012, 12.9784],
            [77.6089, 12.9852]
          ]
        }
      }
    ],
    "traffic": [1.5]
  }'
```

### 3. Expected Response Structure

```json
{
  "success": true,
  "message": "Route scores computed successfully",
  "data": {
    "routes": [
      {
        "routeIndex": 0,
        "distance": 5000,
        "duration": 600,
        "travelMode": "driving",
        "breakpointCount": 3,
        "weatherScore": {
          "temperature": 85.2,
          "humidity": 92.0,
          "pressure": 100.0,
          "overall": 88.4
        },
        "aqiScore": {
          "aqi": 45.5,
          "score": 100.0,
          "category": "Good"
        },
        "trafficScore": 50.0,
        "overallScore": 79.4
      }
    ],
    "bestRoute": {
      "index": 0,
      "score": 79.4
    },
    "summary": {
      "totalRoutes": 1,
      "averageScore": 79.4,
      "scoreRange": {
        "min": 79.4,
        "max": 79.4
      }
    }
  },
  "timestamp": "2026-02-15T14:30:15.123Z"
}
```

### 4. Console Output to Watch For

When the request is processed, you should see console logs like:

```
Processing 1 routes for score computation...
Step 1: Extracting breakpoints...
Extracted breakpoints for 1 routes
Step 2: Fetching weather data...
Fetched weather data for 1 routes
Step 3: Fetching AQI data...
AQI computation complete: 1 routes, 3 total points (Batched Concurrency Limit: 5)
Fetched AQI data for 1 routes
Step 4: Calculating scores...
Score computation completed successfully!
```

### 5. Testing Different Locations

Try different coordinates to see varying AQI values:

**Good Air Quality (e.g., rural areas):**

```json
"coordinates": [[77.5946, 12.9716], [77.6012, 12.9784]]
```

**Poor Air Quality (e.g., industrial areas):**

```json
"coordinates": [[77.2090, 28.6139], [77.2167, 28.6207]]
```

### 6. Verify AQI Categories

The response should show one of these categories based on AQI value:

- **Good** (AQI 0-50): Score 100
- **Moderate** (AQI 51-100): Score 60-80
- **Unhealthy for Sensitive Groups** (AQI 101-150): Score 40-60
- **Unhealthy** (AQI 151-200): Score 20-40
- **Very Unhealthy** (AQI 201-300): Score 0-20
- **Hazardous** (AQI 301+): Score 0

### 7. Error Scenarios to Test

**Missing AQI API Key:**

- Remove `AQI_API_KEY` from `.env`
- Should see error: "AQI_API_KEY not configured"

**Invalid Coordinates:**

```json
"coordinates": [[999, 999]]
```

- Should handle gracefully and log AQI fetch errors

**Multiple Routes:**

```json
{
  "routes": [
    {
      /* route 1 */
    },
    {
      /* route 2 */
    },
    {
      /* route 3 */
    }
  ]
}
```

- Should process all routes and compare AQI scores

### 8. Performance Testing

Monitor the time taken for AQI fetching:

- With 3 routes × 7 breakpoints = 21 AQI API calls
- Batched in groups of 5 (concurrency limit)
- Should complete in ~8-10 seconds

### 9. Integration with Frontend

When integrating with the client, use the `aqiScore` field:

```typescript
interface RouteScore {
  aqiScore: {
    aqi: number; // Raw AQI value
    score: number; // 0-100 score
    category: string; // "Good", "Moderate", etc.
  };
}
```

Display the AQI category with color coding:

- **Good**: Green
- **Moderate**: Yellow
- **Unhealthy for Sensitive Groups**: Orange
- **Unhealthy**: Red
- **Very Unhealthy**: Purple
- **Hazardous**: Maroon

### 10. Troubleshooting

**No AQI data returned:**

- Check if coordinates are valid
- Verify AQI_API_KEY is correct
- Check AQICN API status: https://aqicn.org/api/

**Timeout errors:**

- Increase timeout in `aqi.compute.ts` (currently 8000ms)
- Check network connectivity

**Inconsistent scores:**

- AQI data updates periodically, so values may change
- Different monitoring stations may report different values
