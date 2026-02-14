import { Suspense } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import NotificationPreference from "@/components/profile/NotificationPreference";
import ProfileCard from "@/components/profile/ProfileCard";
import SavedRoutes from "@/components/profile/SavedRoutes";
import type { UserData } from "@/components/profile/types";

async function getUser(): Promise<UserData | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken");

  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/user`,
      {
        headers: {
          Cookie: `refreshToken=${refreshToken.value}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-bc-bg-light min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <ProfileCard user={user} />
        <Suspense
          fallback={
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-100" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl border border-slate-100 bg-slate-50"
                  />
                ))}
              </div>
            </div>
          }
        >
          <SavedRoutes />
        </Suspense>
        <NotificationPreference />
      </main>
    </div>
  );
}
