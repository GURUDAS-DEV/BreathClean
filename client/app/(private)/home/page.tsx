"use client";

export default function Home() {
  const handleLogout = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/logout`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-slate-500">You are logged in!</p>
        <button
          onClick={handleLogout}
          className="rounded-full bg-red-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-red-600 active:scale-95"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
