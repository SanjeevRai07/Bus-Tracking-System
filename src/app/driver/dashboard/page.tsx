"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GpsTracker from "./GpsTracker";

interface Bus {
  id: string;
  bus_number: string;
  driver_name: string;
  route: string;
  status: string;
}

export default function DriverDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // CHECK LOGIN + LOAD BUS
  // ==========================================

  useEffect(() => {
    async function loadDriver() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/driver/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("buses")
        .select(
          "id,bus_number,driver_name,route,status"
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Bus loading error:", error);
        setError("Unable to load bus information.");
        setLoading(false);
        return;
      }

      if (data) {
        setBus(data);
      }

      setLoading(false);
    }

    loadDriver();
  }, [router]);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/driver/login");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#005BAC]" />

            <p className="font-semibold text-[#005BAC]">
              Loading driver dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-100">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="bg-[#005BAC] px-6 py-5 text-white shadow-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl">
                🚌
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  AJU Smart Bus
                </h1>

                <p className="text-sm text-blue-100">
                  Driver Dashboard
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-[#005BAC] shadow-md transition hover:bg-blue-50"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* WELCOME */}
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#005BAC]">
                  DRIVER ACCOUNT
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  ● ACTIVE
                </span>

              </div>

              <h2 className="mt-3 text-3xl font-bold text-slate-800">
                Welcome, Driver 👋
              </h2>

              <p className="mt-2 text-slate-500">
                {email}
              </p>

            </div>

            {/* BUS QUICK INFO */}

            <div className="rounded-2xl bg-blue-50 px-6 py-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assigned Bus
              </p>

              <p className="mt-1 text-xl font-bold text-[#005BAC]">
                {bus?.bus_number ?? "No Bus"}
              </p>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* ======================================
            MAIN CARDS
        ====================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ====================================
              MY BUS
          ==================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-center justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                🚌
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                ACTIVE
              </span>

            </div>

            <h3 className="mt-5 text-xl font-bold text-[#005BAC]">
              My Bus
            </h3>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {bus?.bus_number ?? "No Bus"}
            </p>

            <div className="mt-4 space-y-2">

              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-slate-500">
                  Driver
                </span>

                <span className="text-sm font-semibold text-slate-700">
                  {bus?.driver_name ?? "You"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span className="text-sm font-semibold text-green-600">
                  ● {bus?.status ?? "Active"}
                </span>
              </div>

            </div>

          </div>

          {/* ====================================
              GPS TRACKER
          ==================================== */}

          <GpsTracker />

          {/* ====================================
              MY ROUTE
          ==================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-center justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                🗺️
              </div>

              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                ROUTE
              </span>

            </div>

            <h3 className="mt-5 text-xl font-bold text-[#005BAC]">
              My Route
            </h3>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {bus?.route ?? "AJU Route"}
            </p>

            <div className="mt-5 rounded-2xl bg-purple-50 p-4">

              <p className="text-sm font-semibold text-purple-700">
                🛣️ University Bus Route
              </p>

              <p className="mt-1 text-xs text-purple-500">
                Follow the assigned route during your trip.
              </p>

            </div>

          </div>

        </div>

        {/* ======================================
            TRIP INFORMATION
        ====================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-[#005BAC]">
                Trip Management
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-800">
                Ready for your trip?
              </h3>

              <p className="mt-1 text-slate-500">
                Start GPS when you begin your bus journey.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                📍
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  LOCATION
                </p>

                <p className="font-bold text-[#005BAC]">
                  GPS Controlled
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ======================================
            DRIVER INSTRUCTIONS
        ====================================== */}

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
              1️⃣
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              Start GPS
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Allow location permission when starting your trip.
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              2️⃣
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              Drive Normally
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Your live location will automatically update.
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
              3️⃣
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              Stop GPS
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Stop sharing your location when the trip ends.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}