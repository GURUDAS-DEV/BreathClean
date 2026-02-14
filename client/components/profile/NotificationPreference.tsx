"use client";

import { useState } from "react";

import { Bell, BellOff } from "lucide-react";

export default function NotificationPreference() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="text-bc-primary h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-slate-400" />
          )}
          <div>
            <p className="font-medium text-slate-900">Push Notifications</p>
            <p className="text-sm text-slate-500">
              {enabled
                ? "You'll receive air quality alerts"
                : "Notifications are turned off"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            enabled ? "bg-bc-primary" : "bg-slate-300"
          }`}
        >
          <div
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
