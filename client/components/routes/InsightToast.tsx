"use client";

import { useState } from "react";

import { X } from "lucide-react";

export default function InsightToast({
  pm25Reduction = 30,
  onClose,
}: {
  pm25Reduction?: number;
  onClose?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className="absolute bottom-52 left-1/2 z-50 -translate-x-1/2 lg:bottom-10">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#102216]/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-lg lg:px-6 lg:py-3 dark:bg-slate-900/95 dark:text-slate-100">
        <div className="size-2 animate-pulse rounded-full bg-[#2bee6c]"></div>
        <p className="text-xs font-medium lg:text-sm">
          Health Insight:{" "}
          <span className="font-bold text-[#2bee6c]">
            PM2.5 -{pm25Reduction}%
          </span>{" "}
          <span className="hidden sm:inline">compared to your last trip.</span>
        </p>
        <button
          onClick={handleClose}
          className="text-white/40 transition-colors hover:text-white dark:text-slate-500 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
