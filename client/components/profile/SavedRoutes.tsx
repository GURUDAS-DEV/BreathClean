import Link from "next/link";

import { Clock, Inbox, MapPin } from "lucide-react";

import type { ISavedRoute } from "../saved-routes/types";
import SavedRouteItemClient from "./SavedRouteItemClient";

function getAqiBadge(aqi: number) {
  if (aqi <= 50)
    return { label: "Good", color: "bg-emerald-100 text-emerald-700" };
  if (aqi <= 100)
    return { label: "Moderate", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Poor", color: "bg-red-100 text-red-700" };
}

interface SavedRoutesProps {
  routes: ISavedRoute[];
}

export default function SavedRoutes({ routes }: SavedRoutesProps) {
  if (routes.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <Inbox className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No Routes Found
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
            You haven&apos;t saved any routes yet. Start exploring to find the
            cleanest paths for your journey.
          </p>
          <Link
            href="/home"
            className="mt-6 inline-block rounded-xl bg-[#2bee6c] px-6 py-2.5 text-sm font-bold text-[#102216] shadow-md shadow-[#2bee6c]/10 transition-all hover:opacity-90 active:scale-95"
          >
            Find a Route
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Saved Routes</h3>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-400">
          Showing Top {routes.length}
        </span>
      </div>
      <div className="space-y-3">
        {routes.map((route) => {
          const aqi = route.routes?.[0]?.lastComputedScore ?? 0;
          const badge = getAqiBadge(aqi);

          const date = new Date(route.updatedAt);
          const lastUsed = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });

          return (
            <Link
              key={route._id}
              href={`/saved-routes?id=${route._id}`}
              className="group flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:border-[#2bee6c]/30 hover:bg-slate-50/50"
            >
              <SavedRouteItemClient routeId={route._id} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                  {route.name || "Untitled Route"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {route.from.address.split(",")[0]} →{" "}
                  {route.to.address.split(",")[0]}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.color} border border-current opacity-90`}
                >
                  AQI {aqi} · {badge.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <Clock className="h-3 w-3" />
                  {lastUsed}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
