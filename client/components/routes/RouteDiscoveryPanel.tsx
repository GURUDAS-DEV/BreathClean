"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Activity, Bike, Car, CircleDot, MapPin, User } from "lucide-react";

type TravelMode = "walking" | "driving" | "cycling";

type RouteDiscoveryPanelProps = {
  sourceAddress: string;
  destAddress: string;
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  onAvoidBusyRoadsChange?: (avoid: boolean) => void;
};

export default function RouteDiscoveryPanel({
  sourceAddress,
  destAddress,
  selectedMode,
  onModeChange,
  onAvoidBusyRoadsChange,
}: RouteDiscoveryPanelProps) {
  const router = useRouter();
  const [avoidBusyRoads, setAvoidBusyRoads] = useState(false);

  const toggleAvoidBusyRoads = () => {
    const newState = !avoidBusyRoads;
    setAvoidBusyRoads(newState);
    if (onAvoidBusyRoadsChange) {
      onAvoidBusyRoadsChange(newState);
    }
  };

  const handleChangeRoute = () => {
    router.push("/home");
  };

  return (
    <aside className="absolute top-6 left-6 z-40 w-80">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h1 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">
            Route Discovery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Find the path with lowest pollution
          </p>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          {/* From/To Inputs */}
          <div className="relative space-y-3">
            {/* Dashed line connecting inputs */}
            <div className="absolute top-9 bottom-9 left-[19px] w-0.5 border-l border-dashed border-slate-200 dark:border-slate-700"></div>

            <div className="relative">
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                From
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all focus-within:border-[#2bee6c] focus-within:ring-1 focus-within:ring-[#2bee6c]/20 dark:border-slate-700 dark:bg-slate-800">
                <CircleDot className="scale-90 text-blue-500" size={18} />
                <input
                  className="w-full border-none bg-transparent p-0 text-sm placeholder:text-slate-400 focus:ring-0 dark:text-white"
                  placeholder="Start location"
                  type="text"
                  value={sourceAddress || "Loading..."}
                  readOnly
                />
              </div>
            </div>

            <div className="relative">
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                To
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all focus-within:border-[#2bee6c] focus-within:ring-1 focus-within:ring-[#2bee6c]/20 dark:border-slate-700 dark:bg-slate-800">
                <MapPin className="text-red-500" size={18} />
                <input
                  className="w-full border-none bg-transparent p-0 text-sm placeholder:text-slate-400 focus:ring-0 dark:text-white"
                  placeholder="Enter destination..."
                  type="text"
                  value={destAddress || "Loading..."}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Transport Mode
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => onModeChange("driving")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 transition-all ${
                  selectedMode === "driving"
                    ? "bg-white text-[#2bee6c] shadow-sm dark:bg-slate-700 dark:text-[#2bee6c]"
                    : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <Car size={18} />
                <span className="text-[10px] font-bold uppercase">Drive</span>
              </button>
              <button
                onClick={() => onModeChange("cycling")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 transition-all ${
                  selectedMode === "cycling"
                    ? "bg-white text-[#2bee6c] shadow-sm dark:bg-slate-700 dark:text-[#2bee6c]"
                    : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <Bike size={18} />
                <span className="text-[10px] font-bold uppercase">Cycle</span>
              </button>
              <button
                onClick={() => onModeChange("walking")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 transition-all ${
                  selectedMode === "walking"
                    ? "bg-white text-[#2bee6c] shadow-sm dark:bg-slate-700 dark:text-[#2bee6c]"
                    : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <User size={18} />
                <span className="text-[10px] font-bold uppercase">Walk</span>
              </button>
            </div>
          </div>

          {/* Filter Preferences */}
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Preferences
            </label>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Avoid Busy Roads
              </span>
              <button
                role="switch"
                aria-checked={avoidBusyRoads}
                onClick={toggleAvoidBusyRoads}
                className={`relative h-6 w-11 rounded-full transition-colors focus:ring-2 focus:ring-[#2bee6c] focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900 ${
                  avoidBusyRoads
                    ? "bg-[#2bee6c]"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    avoidBusyRoads ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            onClick={handleChangeRoute}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2bee6c] py-3.5 font-bold text-slate-900 shadow-lg shadow-[#2bee6c]/20 transition-all hover:bg-[#2bee6c]/90"
          >
            <Activity className="h-5 w-5" />
            Change Route
          </button>
        </div>
      </div>
    </aside>
  );
}
