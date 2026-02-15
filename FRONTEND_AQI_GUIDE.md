# Frontend AQI Integration Guide

## Changes Made to Frontend

### 1. Updated Type Definitions

**File: `client/app/(private)/home/routes/(from)/(to)/page.tsx`**

Added `aqiScore` field to the `RouteData` type:

```typescript
type RouteData = {
  // ... existing fields
  aqiScore?: {
    aqi: number; // Raw AQI value (0-500+)
    score: number; // Normalized score (0-100)
    category: string; // "Good", "Moderate", "Unhealthy", etc.
  };
  // ... other fields
};
```

### 2. Updated API Response Handling

**File: `client/app/(private)/home/routes/(from)/(to)/page.tsx`**

Modified the `fetchScores` function to extract and store AQI data from the backend:

```typescript
const scores = scoredRoutes.map((sr) => ({
  overall: sr.overallScore,
  weather: sr.weatherScore?.overall,
  aqi: sr.aqiScore, // ← NEW: Extract AQI data
  traffic: sr.trafficScore,
}));

// Store in route state
setRoutes((prev) =>
  prev.map((route, i) => ({
    ...route,
    aqiScore: scores[i]?.aqi, // ← NEW: Add to route
    // ... other scores
  }))
);
```

### 3. Updated UI Component

**File: `client/components/routes/RouteComparisonPanel.tsx`**

Added AQI display section to each route card with color-coded categories:

```tsx
{
  route.aqiScore && (
    <div className="mt-3 flex items-center justify-between border-t">
      <div className="flex items-center gap-2">
        <Wind className="text-slate-400" size={14} />
        <span className="text-xs">Air Quality</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={getCategoryColor(route.aqiScore.category)}>
          {route.aqiScore.category}
        </span>
        <span className="text-xs font-bold">
          {Math.round(route.aqiScore.aqi)}
        </span>
      </div>
    </div>
  );
}
```

## Color Coding for AQI Categories

The UI uses color-coded badges to represent different AQI levels:

| Category                           | AQI Range | Color     | Meaning                                               |
| ---------------------------------- | --------- | --------- | ----------------------------------------------------- |
| **Good**                           | 0-50      | 🟢 Green  | Air quality is satisfactory                           |
| **Moderate**                       | 51-100    | 🟡 Yellow | Acceptable for most people                            |
| **Unhealthy for Sensitive Groups** | 101-150   | 🟠 Orange | Sensitive groups may experience effects               |
| **Unhealthy**                      | 151-200   | 🔴 Red    | Everyone may begin to experience effects              |
| **Very Unhealthy**                 | 201-300   | 🟣 Purple | Health alert: everyone may experience serious effects |
| **Hazardous**                      | 301+      | 🟤 Maroon | Health warning of emergency conditions                |

## Visual Example

### Route Card with AQI Data

```
┌─────────────────────────────────────┐
│  Cleanest Path          Score: 87   │
│  via Main Roads                     │
├─────────────────────────────────────┤
│  ⏱ 15 min     📏 5.2 km            │
├─────────────────────────────────────┤
│  💨 Air Quality    [Good] 45       │  ← NEW AQI Display
├─────────────────────────────────────┤
│  Pollution Exposure    -15% avg.    │
└─────────────────────────────────────┘
```

## How It Works

1. **User searches for routes** → Frontend sends request to backend
2. **Backend computes scores** → Includes AQI data from AQICN API
3. **Frontend receives response** → Extracts `aqiScore` from each route
4. **UI displays AQI** → Shows category badge and AQI value
5. **User compares routes** → Can see which route has better air quality

## Testing the Frontend

### 1. Start the Development Server

```bash
cd client
npm run dev
```

### 2. Navigate to Routes Page

Go to: `http://localhost:3000/home/routes?from=77.5946,12.9716&to=77.6012,12.9784`

### 3. Check for AQI Display

You should see:

- ✅ AQI category badge (colored)
- ✅ AQI value (number)
- ✅ Wind icon (💨)
- ✅ "Air Quality" label

### 4. Verify Different Categories

Try different locations to see various AQI categories:

**Good Air Quality (Rural/Coastal):**

```
from=77.5946,12.9716&to=77.6012,12.9784
```

**Moderate/Unhealthy (Urban/Industrial):**

```
from=77.2090,28.6139&to=77.2167,28.6207
```

## Responsive Design

The AQI display is fully responsive:

- **Mobile**: Horizontal scroll cards with AQI info
- **Desktop**: Vertical sidebar cards with AQI info
- **Dark Mode**: Automatically adjusts colors

## Error Handling

If AQI data is not available:

- The AQI section won't be displayed
- The route will still show other scores (weather, traffic)
- No error message is shown (graceful degradation)

## Future Enhancements

Consider adding:

1. **AQI Trend Indicator**: Show if AQI is improving or worsening
2. **Detailed Pollutant Breakdown**: Show PM2.5, PM10, O3, etc.
3. **Health Recommendations**: Based on AQI category
4. **AQI Alerts**: Notify users when AQI is unhealthy
5. **Historical AQI Data**: Show AQI trends over time

## Troubleshooting

### AQI Not Showing

**Problem**: AQI data not displayed on route cards

**Solutions**:

1. Check browser console for API errors
2. Verify backend is running and AQI_API_KEY is set
3. Check network tab for `/api/v1/score/compute` response
4. Ensure response includes `aqiScore` field

### Incorrect Colors

**Problem**: AQI category colors don't match

**Solution**: Check the category string matches exactly:

- "Good" (not "good")
- "Moderate" (not "moderate")
- "Unhealthy for Sensitive Groups" (exact match)

### Missing Wind Icon

**Problem**: Wind icon not showing

**Solution**: Ensure `lucide-react` is installed:

```bash
npm install lucide-react
```

## Code Locations

All changes are in these files:

1. **Type Definitions**: `client/app/(private)/home/routes/(from)/(to)/page.tsx` (line 21-40)
2. **API Handling**: `client/app/(private)/home/routes/(from)/(to)/page.tsx` (line 170-220)
3. **UI Component**: `client/components/routes/RouteComparisonPanel.tsx` (line 247-277)

## Summary

✅ **Frontend is now fully integrated with AQI data!**

Users can now:

- See air quality for each route
- Compare routes based on AQI
- Make healthier route choices
- View color-coded AQI categories

The integration is complete and ready for production! 🎉
