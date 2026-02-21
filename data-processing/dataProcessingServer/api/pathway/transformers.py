"""
Scoring transformers for BreathClean Pathway pipeline.
Ported from server/src/controllers/score.controller.ts
"""
import math
from typing import Dict, List, Optional, Any


def calculate_temperature_score(temp: float) -> float:
    """
    Calculate weather score based on temperature.
    Optimal: 21°C
    Stricter curve: Deviating by 5°C drops score to ~70
    """
    optimal = 21
    diff = abs(temp - optimal)

    # Perfect range: +/- 1°C
    if diff <= 1:
        return 100.0

    # Stricter penalty: loss of 6 points per degree deviation
    return max(0.0, 100.0 - diff * 6)


def calculate_humidity_score(humidity: float) -> float:
    """
    Calculate weather score based on humidity.
    Optimal: 50%
    Perfect range: 45-55%
    """
    if 45 <= humidity <= 55:
        return 100.0

    ideal = 50
    diff = abs(humidity - ideal)

    # Penalty: loss of 2 points per percent deviation outside optimal
    return max(0.0, 100.0 - (diff - 5) * 2)


def calculate_pressure_score(pressure: float) -> float:
    """
    Calculate weather score based on pressure.
    Optimal: 1013 hPa
    """
    optimal = 1013
    diff = abs(pressure - optimal)

    if diff <= 2:
        return 100.0

    return max(0.0, 100.0 - (diff - 2) * 4)


def calculate_weather_score(weather_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate overall weather score for a route.
    Returns scores and raw averages.
    """
    total_temp = 0.0
    total_humidity = 0.0
    total_pressure = 0.0
    valid_points = 0

    # Per-field counters so averages aren't skewed by missing fields
    temp_count = 0
    humidity_count = 0
    pressure_count = 0

    raw_temp_sum = 0.0
    raw_humidity_sum = 0.0
    raw_pressure_sum = 0.0

    for point in weather_points:
        main = point.get("main", {})
        if main:
            temp = main.get("temp")
            humidity = main.get("humidity")
            pressure = main.get("pressure")

            if temp is not None:
                total_temp += calculate_temperature_score(temp)
                raw_temp_sum += temp
                temp_count += 1
            if humidity is not None:
                total_humidity += calculate_humidity_score(humidity)
                raw_humidity_sum += humidity
                humidity_count += 1
            if pressure is not None:
                total_pressure += calculate_pressure_score(pressure)
                raw_pressure_sum += pressure
                pressure_count += 1

            valid_points += 1

    if valid_points == 0:
        return {
            "temperature": 0.0,
            "humidity": 0.0,
            "pressure": 0.0,
            "overall": 0.0,
            "details": None
        }

    temp_score = total_temp / temp_count if temp_count > 0 else 0.0
    humidity_score = total_humidity / humidity_count if humidity_count > 0 else 0.0
    pressure_score = total_pressure / pressure_count if pressure_count > 0 else 0.0

    # Overall weather score (weighted average)
    # Temperature is most perceptible to humans, so higher weight
    overall = temp_score * 0.5 + humidity_score * 0.3 + pressure_score * 0.2

    return {
        "temperature": round(temp_score, 1),
        "humidity": round(humidity_score, 1),
        "pressure": round(pressure_score, 1),
        "overall": round(overall, 1),
        "details": {
            "avgTemp": round(raw_temp_sum / temp_count, 1) if temp_count > 0 else None,
            "avgHumidity": round(raw_humidity_sum / humidity_count, 1) if humidity_count > 0 else None,
            "avgPressure": round(raw_pressure_sum / pressure_count, 1) if pressure_count > 0 else None
        }
    }


def calculate_aqi_score(aqi_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate AQI score based on Air Quality Index.
    AQI Scale (Stricter):
    0-20: Excellent (100)
    21-50: Good (100 -> 80 gradient)
    51-100: Moderate (80 -> 50 gradient)
    101-150: Unhealthy for Sensitive (50 -> 30)
    151-200: Unhealthy (30 -> 10)
    200+: Very Unhealthy/Hazardous (10 -> 0)
    """
    total_aqi = 0.0
    valid_points = 0

    # Pollutant aggregation
    pollutant_totals = {"pm25": 0, "pm10": 0, "o3": 0, "no2": 0, "so2": 0, "co": 0}
    pollutant_counts = {"pm25": 0, "pm10": 0, "o3": 0, "no2": 0, "so2": 0, "co": 0}
    dominentpol = None

    for point in aqi_points:
        aqi_data = point.get("aqi", {})
        if aqi_data:
            aqi_val = aqi_data.get("aqi")
            if aqi_val is not None:
                try:
                    val = float(aqi_val)
                    total_aqi += val
                    valid_points += 1
                except (ValueError, TypeError):
                    pass

            # Get dominant pollutant
            if aqi_data.get("dominentpol"):
                dominentpol = aqi_data["dominentpol"]

            # Aggregate pollutants
            iaqi = aqi_data.get("iaqi", {})
            for pol in pollutant_totals.keys():
                pol_data = iaqi.get(pol, {})
                if isinstance(pol_data, dict) and "v" in pol_data:
                    pollutant_totals[pol] += pol_data["v"]
                    pollutant_counts[pol] += 1

    # CRITICAL: If no valid data, default to 0 score (not 100)
    if valid_points == 0:
        return {
            "aqi": 0,
            "score": 0.0,
            "category": "Unknown - No Data",
            "details": None
        }

    avg_aqi = total_aqi / valid_points

    # Calculate score based on AQI value (inverted - lower AQI is better)
    if avg_aqi <= 20:
        score = 100.0
        category = "Excellent"
    elif avg_aqi <= 50:
        score = 100.0 - ((avg_aqi - 20) / 30) * 20
        category = "Good"
    elif avg_aqi <= 100:
        score = 80.0 - ((avg_aqi - 50) / 50) * 30
        category = "Moderate"
    elif avg_aqi <= 150:
        score = 50.0 - ((avg_aqi - 100) / 50) * 20
        category = "Unhealthy for Sensitive Groups"
    elif avg_aqi <= 200:
        score = 30.0 - ((avg_aqi - 150) / 50) * 20
        category = "Unhealthy"
    else:
        score = max(0.0, 10.0 - ((avg_aqi - 200) / 100) * 10)
        category = "Very Unhealthy" if avg_aqi <= 300 else "Hazardous"

    # Build pollutant details
    pollutants = {}
    for pol, total in pollutant_totals.items():
        count = pollutant_counts[pol]
        if count > 0:
            pollutants[pol] = round(total / count, 1)

    return {
        "aqi": round(avg_aqi, 1),
        "score": round(score, 1),
        "category": category,
        "details": {
            "dominentpol": dominentpol,
            "pollutants": pollutants if pollutants else None
        }
    }


def calculate_traffic_score(traffic_value: float) -> float:
    """
    Calculate traffic score (normalize to 0-100 scale).
    Lower traffic value = better score.
    Non-linear penalty for congestion.
    
    trafficValue: 0 (clear) to 3 (severe)
    0.5 (light) -> ~71.5
    1.0 (moderate) -> ~53.5
    2.0 (heavy) -> ~24.7
    3.0 (severe) -> 0
    """
    if traffic_value <= 0:
        return 100.0

    # Power curve to maintain high score only for VERY clear roads
    normalized = min(traffic_value / 3, 1)  # 0 to 1
    penalty = math.pow(normalized, 0.7)  # Convex curve

    score = round((1 - penalty) * 100, 1)
    return score


def calculate_overall_score(
    weather_score: float,
    aqi_score: float,
    traffic_score: float
) -> float:
    """
    Calculate overall route score (weighted combination).
    Weather: 40%, AQI: 30%, Traffic: 30%
    """
    overall = weather_score * 0.4 + aqi_score * 0.3 + traffic_score * 0.3
    return round(overall, 1)


def compute_route_score(route_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to compute complete score for a single route.
    
    Input format:
    {
        "routeIndex": 0,
        "distance": 12345,
        "duration": 1800,
        "travelMode": "driving",
        "weatherPoints": [...],  # Weather API responses for breakpoints
        "aqiPoints": [...],      # AQI API responses for breakpoints
        "trafficValue": 0.5,     # Traffic factor (0-3)
        "lastComputedScore": 75.0  # Optional: previous score for delta
    }
    
    Output format (ready for MongoDB):
    {
        "routeIndex": 0,
        "distance": 12345,
        "duration": 1800,
        "travelMode": "driving",
        "breakpointCount": 3,
        "weatherScore": {...},
        "aqiScore": {...},
        "trafficScore": 85.0,
        "overallScore": 78.5,
        "scoreChange": 3.5,
        "computedAt": "2026-02-16T12:00:00Z"
    }
    """
    from datetime import datetime, timezone

    weather_points = route_data.get("weatherPoints", [])
    aqi_points = route_data.get("aqiPoints", [])
    traffic_value = route_data.get("trafficValue", 0)
    last_score = route_data.get("lastComputedScore")

    # Calculate individual scores
    weather_result = calculate_weather_score(weather_points)
    aqi_result = calculate_aqi_score(aqi_points)
    traffic_score = calculate_traffic_score(traffic_value)

    # Calculate overall score
    overall_score = calculate_overall_score(
        weather_result["overall"],
        aqi_result["score"],
        traffic_score
    )

    # Calculate score change
    score_change = None
    if last_score is not None:
        score_change = round(overall_score - last_score, 1)

    return {
        "routeIndex": route_data.get("routeIndex", 0),
        "routeId": route_data.get("routeId"),  # MongoDB ObjectId if provided
        "distance": route_data.get("distance"),
        "duration": route_data.get("duration"),
        "travelMode": route_data.get("travelMode"),
        "breakpointCount": max(len(weather_points), len(aqi_points)),
        "weatherScore": {
            "temperature": weather_result["temperature"],
            "humidity": weather_result["humidity"],
            "pressure": weather_result["pressure"],
            "overall": weather_result["overall"]
        },
        "weatherDetails": weather_result["details"],
        "aqiScore": {
            "aqi": aqi_result["aqi"],
            "score": aqi_result["score"],
            "category": aqi_result["category"]
        },
        "aqiDetails": aqi_result["details"],
        "trafficScore": traffic_score,
        "overallScore": overall_score,
        "lastComputedScore": last_score,
        "scoreChange": score_change,
        "computedAt": datetime.now(timezone.utc).isoformat()
    }


def compute_batch_scores(routes_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute scores for multiple routes in batch.
    Returns scores + summary statistics.
    """
    from datetime import datetime, timezone

    if not routes_data:
        return {
            "success": False,
            "message": "No routes provided",
            "routes": [],
            "summary": None
        }

    route_scores = []
    for route in routes_data:
        score = compute_route_score(route)
        route_scores.append(score)

    # Find best route
    best_route = max(route_scores, key=lambda r: r["overallScore"])

    # Calculate summary statistics
    overall_scores = [r["overallScore"] for r in route_scores]
    avg_score = round(sum(overall_scores) / len(overall_scores), 1)

    return {
        "success": True,
        "message": "Batch scores computed successfully",
        "routes": route_scores,
        "bestRoute": {
            "index": best_route["routeIndex"],
            "routeId": best_route.get("routeId"),
            "score": best_route["overallScore"]
        },
        "summary": {
            "totalRoutes": len(route_scores),
            "averageScore": avg_score,
            "scoreRange": {
                "min": min(overall_scores),
                "max": max(overall_scores)
            }
        },
        "computedAt": datetime.now(timezone.utc).isoformat()
    }
