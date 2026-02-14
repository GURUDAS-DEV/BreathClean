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
        <SavedRoutes />
        <NotificationPreference />
      </main>
    </div>
  );
}
