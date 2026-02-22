"use client";

import { useRouter } from "next/navigation";

import {
  Bike,
  Bookmark,
  Car,
  ChevronLeft,
  CircleDot,
  Map,
  MapPin,
  User,
} from "lucide-react";

type TravelMode = "walking" | "driving" | "cycling";

type RouteDiscoveryPanelProps = {
  sourceAddress: string;
  destAddress: string;
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  onSaveRoute: () => void;
  canSave: boolean;
  googleMapsUrl: string | null;
};

export default function RouteDiscoveryPanel({
  sourceAddress,
  destAddress,
  selectedMode,
  onModeChange,
  onSaveRoute,
  canSave,
  googleMapsUrl,
}: RouteDiscoveryPanelProps) {
  const router = useRouter();

  const handleChangeRoute = () => {
    router.push("/home");
  };

  const truncate = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) + "…" : s;

  return (
    <>
      {/* ===== MOBILE: Compact Top Bar (below AppNavbar) ===== */}
      <div className="absolute inset-x-0 top-14 z-40 lg:hidden">
        <div className="bg-white/95 shadow-lg backdrop-blur-xl dark:bg-slate-900/95">
          {/* Row 1: Back + Route info + Save */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-3">
            <button
              onClick={handleChangeRoute}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CircleDot size={10} className="flex-shrink-0 text-[#2bee6c]" />
                <span className="truncate">
                  {truncate(sourceAddress || "Loading...", 30)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <MapPin size={10} className="flex-shrink-0 text-red-500" />
                <span className="truncate">
                  {truncate(destAddress || "Loading...", 30)}
                </span>
              </div>
            </div>

            <a
              href={googleMapsUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!googleMapsUrl}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                googleMapsUrl
                  ? "bg-[#2bee6c] text-slate-900 shadow-md"
                  : "pointer-events-none bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              <Map size={16} />
            </a>
            <button
              onClick={onSaveRoute}
              disabled={!canSave}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                canSave
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
              }`}
            >
              <Bookmark size={15} />
            </button>
          </div>

          {/* Row 2: Transport Mode Pills */}
          <div className="flex gap-1 border-t border-slate-100 px-4 py-2 dark:border-slate-800">
            {(
              [
                { mode: "driving" as TravelMode, icon: Car, label: "Drive" },
                { mode: "cycling" as TravelMode, icon: Bike, label: "Cycle" },
                { mode: "walking" as TravelMode, icon: User, label: "Walk" },
              ] as const
            ).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  selectedMode === mode
                    ? "bg-[#2bee6c]/10 text-[#2bee6c]"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Original Left Sidebar ===== */}
      <aside className="absolute top-6 left-6 z-40 hidden w-80 lg:block">
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
            <div className="relative space-y-4">
              {/* Dashed line connecting inputs */}
              <div className="absolute top-8 bottom-9 left-[19px] w-0.5 border-l border-dashed border-slate-200 dark:border-slate-700"></div>

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

          <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <a
              href={googleMapsUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!googleMapsUrl}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-lg transition-all ${
                googleMapsUrl
                  ? "bg-[#2bee6c] text-slate-900 shadow-[#2bee6c]/20 hover:bg-[#2bee6c]/90"
                  : "pointer-events-none cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
              }`}
            >
              <Map className="h-5 w-5" />
              Open in Google Maps
            </a>
            <button
              onClick={onSaveRoute}
              disabled={!canSave}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                canSave
                  ? "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  : "cursor-not-allowed text-slate-300 dark:text-slate-600"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Save Route
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
