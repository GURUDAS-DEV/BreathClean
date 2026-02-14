"use client";

import { useRouter } from "next/navigation";

import {
  Bike,
  Bookmark,
  Car,
  ChevronLeft,
  CircleDot,
  Info,
  MapPin,
  Tag,
  User,
} from "lucide-react";

type TravelMode = "walking" | "driving" | "cycling";

type RouteDiscoveryPanelProps = {
  sourceAddress: string;
  destAddress: string;
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  routeName: string;
  onRouteNameChange: (name: string) => void;
  onSaveRoute: () => void;
  canSave: boolean;
};

export default function RouteDiscoveryPanel({
  sourceAddress,
  destAddress,
  selectedMode,
  onModeChange,
  routeName,
  onRouteNameChange,
  onSaveRoute,
  canSave,
}: RouteDiscoveryPanelProps) {
  const router = useRouter();

  const handleChangeRoute = () => {
    router.push("/home");
  };

  return (
    <aside className="absolute top-6 left-6 z-40 w-80">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleChangeRoute}
              className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Change Route"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">
                Route Discovery
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find the path with lowest pollution
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          {/* From/To Inputs */}
          {/* Inputs Section */}
          <div className="relative space-y-4">
            {/* Route Name Input */}
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Route Name
                </label>
                <div className="group relative cursor-help">
                  <Info
                    size={12}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  />
                  <div className="absolute top-0 right-full mr-2 hidden w-48 -translate-x-2 rounded-lg border border-slate-200 bg-white p-2 text-[10px] text-slate-600 shadow-xl group-hover:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    This name will be used when you save the route to your
                    favorites.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all focus-within:border-[#2bee6c] focus-within:ring-1 focus-within:ring-[#2bee6c]/20 dark:border-slate-700 dark:bg-slate-800">
                <Tag className="scale-90 text-[#2bee6c]" size={18} />
                <input
                  className="w-full border-none bg-transparent p-0 text-sm placeholder:text-slate-400 focus:ring-0 dark:text-white"
                  placeholder="e.g. Morning Commute"
                  type="text"
                  value={routeName}
                  onChange={(e) => onRouteNameChange(e.target.value)}
                />
              </div>
            </div>

            {/* Dashed line connecting inputs (Adjusted top) */}
            <div className="absolute top-[92px] bottom-9 left-[19px] w-0.5 border-l border-dashed border-slate-200 dark:border-slate-700"></div>

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
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            onClick={onSaveRoute}
            disabled={!canSave}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-lg transition-all ${
              canSave
                ? "bg-[#2bee6c] text-slate-900 shadow-[#2bee6c]/20 hover:bg-[#2bee6c]/90"
                : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
            }`}
          >
            <Bookmark className="h-5 w-5" />
            Save Route
          </button>
        </div>
      </div>
    </aside>
  );
}
