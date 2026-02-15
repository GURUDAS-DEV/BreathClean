# 🚀 AQI Integration - Quick Start Guide

## ⚡ TL;DR

Air Quality Index (AQI) is now integrated! Routes show real-time air quality with color-coded badges.

---

## 🎯 What Changed?

### Backend

- ✅ New AQI API integration (AQICN)
- ✅ AQI scoring added to routes
- ✅ Score weighting: Weather 40% + **AQI 30%** + Traffic 30%

### Frontend

- ✅ AQI displayed on route cards
- ✅ Color-coded badges (Green = Good, Red = Unhealthy, etc.)
- ✅ Wind icon (💨) for air quality section

---

## 🏃 Quick Test (2 minutes)

### 1. Start Backend

```bash
cd server
npm run dev
```

### 2. Start Frontend

```bash
cd client
npm run dev
```

### 3. Open Browser

```
http://localhost:3000/home/routes?from=77.5946,12.9716&to=77.6012,12.9784
```

### 4. Look for AQI

You should see on each route card:

```
💨 Air Quality    [Good] 45
                   ^^^^
                  GREEN BADGE
```

---

## 📋 Files Changed

### Backend (3 files)

1. `server/src/utils/compute/aqi.compute.ts` ← NEW
2. `server/src/controllers/score.controller.ts` ← UPDATED
3. `server/.env` ← UPDATED (added AQI_API_KEY)

### Frontend (2 files)

1. `client/app/(private)/home/routes/(from)/(to)/page.tsx` ← UPDATED
2. `client/components/routes/RouteComparisonPanel.tsx` ← UPDATED

---

## 🎨 AQI Colors

| AQI     | Category              | Color     |
| ------- | --------------------- | --------- |
| 0-50    | Good                  | 🟢 Green  |
| 51-100  | Moderate              | 🟡 Yellow |
| 101-150 | Unhealthy (Sensitive) | 🟠 Orange |
| 151-200 | Unhealthy             | 🔴 Red    |
| 201-300 | Very Unhealthy        | 🟣 Purple |
| 301+    | Hazardous             | 🟤 Maroon |

---

## 🔧 Environment Setup

Make sure this is in `server/.env`:

```
AQI_API_KEY=dd3370fe580fbed3c5f9432b212f8b6401edbf4d
```

---

## ✅ Verification

### Backend Working?

Check server logs for:

```
Step 3: Fetching AQI data...
AQI computation complete: 1 routes, 7 total points
```

### Frontend Working?

Check route cards for:

- Wind icon (💨)
- "Air Quality" label
- Colored category badge
- AQI number

---

## 📚 Full Documentation

For detailed information, see:

1. **`AQI_COMPLETE_SUMMARY.md`** - Complete overview
2. **`AQI_INTEGRATION_SUMMARY.md`** - Backend details
3. **`FRONTEND_AQI_GUIDE.md`** - Frontend details
4. **`AQI_TESTING_GUIDE.md`** - Testing instructions
5. **`AQI_UI_VISUAL_GUIDE.md`** - UI mockups

---

## 🐛 Common Issues

### AQI Not Showing?

**Check 1**: Is backend running?

```bash
curl http://localhost:8000/api/v1/score/compute
```

**Check 2**: Is AQI_API_KEY set?

```bash
cat server/.env | grep AQI_API_KEY
```

**Check 3**: Check browser console

```
F12 → Console → Look for errors
```

**Check 4**: Check network tab

```
F12 → Network → Find /api/v1/score/compute → Check response
```

---

## 🎉 That's It!

You're all set! The AQI integration is complete and working.

**Next Steps:**

1. Test with different locations
2. Check different AQI levels
3. Deploy to production (don't forget to add AQI_API_KEY!)

**Happy coding! 🌿💚**
