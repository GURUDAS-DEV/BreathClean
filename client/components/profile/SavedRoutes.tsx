import { Clock, MapPin, Navigation } from "lucide-react";

const savedRoutes = [
  {
    name: "Home to Office",
    from: "Connaught Place",
    to: "Cyber City, Gurugram",
    aqiScore: 62,
    lastUsed: "Today",
  },
  {
    name: "Morning Jog Route",
    from: "Lodhi Garden Gate 1",
    to: "Lodhi Garden Gate 3",
    aqiScore: 45,
    lastUsed: "Yesterday",
  },
  {
    name: "Weekend Market",
    from: "Sarojini Nagar Metro",
    to: "Sarojini Nagar Market",
    aqiScore: 89,
    lastUsed: "3 days ago",
  },
];

function getAqiBadge(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "bg-green-100 text-green-700" };
  if (aqi <= 100)
    return { label: "Moderate", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Poor", color: "bg-red-100 text-red-700" };
}

export default function SavedRoutes() {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Saved Routes</h3>
        <span className="text-sm text-slate-400">
          {savedRoutes.length} routes
        </span>
      </div>
      <div className="space-y-3">
        {savedRoutes.map((route) => {
          const badge = getAqiBadge(route.aqiScore);
          return (
            <div
              key={route.name}
              className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Navigation className="text-bc-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{route.name}</p>
                <p className="truncate text-sm text-slate-500">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {route.from} → {route.to}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
                >
                  AQI {route.aqiScore} · {badge.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {route.lastUsed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
