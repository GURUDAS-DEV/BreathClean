import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import NotificationPreference from "@/components/profile/NotificationPreference";
import ProfileCard from "@/components/profile/ProfileCard";
import SavedRoutes from "@/components/profile/SavedRoutes";
import type { UserData } from "@/components/profile/types";
import type { ISavedRoute } from "@/components/saved-routes/types";

async function getUser(refreshToken: string): Promise<UserData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/user`,
      {
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
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

async function getTopRoutes(refreshToken: string): Promise<ISavedRoute[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saved-routes`,
      {
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.success && data.routes ? data.routes.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken");

  if (!refreshToken) {
    redirect("/login");
  }

  // Fetch user and routes in parallel
  const [user, routes] = await Promise.all([
    getUser(refreshToken.value),
    getTopRoutes(refreshToken.value),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-bc-bg-light min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <ProfileCard user={user} />
        <SavedRoutes routes={routes} />
        <NotificationPreference />
      </main>
    </div>
  );
}
