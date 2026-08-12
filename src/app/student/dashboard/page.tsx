"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const StudentLiveMap = dynamic(() => import("./StudentLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-[28px] bg-slate-950">
      <div className="text-center">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        <p className="font-semibold text-white">Loading live map...</p>
        <p className="mt-1 text-sm text-slate-400">
          Connecting to GPS services
        </p>
      </div>
    </div>
  ),
});

interface BusLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  bus?: {
    id: string;
    bus_number: string;
    driver_name: string;
    route: string;
    status: string;
  };
}

export default function StudentDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/student/login");
      return;
    }

    setEmail(user.email ?? "");

    const { data, error } = await supabase
      .from("live_locations")
      .select(`
        id,
        bus_id,
        latitude,
        longitude,
        updated_at,
        buses (
          id,
          bus_number,
          driver_name,
          route,
          status
        )
      `);

    if (error) {
      console.error("Student bus loading error:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const formatted: BusLocation[] = data.map((item: any) => ({
        id: item.id,
        bus_id: item.bus_id,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        updated_at: item.updated_at,
        bus: Array.isArray(item.buses) ? item.buses[0] : item.buses,
      }));

      setLocations(formatted);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("student_live_locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/student/login");
  }

  const firstLetter = email.charAt(0).toUpperCase() || "S";

  return (
    <main className="min-h-screen bg-[#f4f8fc] text-slate-900">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061a33]/95 shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-5 py-4 sm:px-8">

          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c6ff] to-[#0066ff] text-2xl shadow-lg shadow-blue-500/30">
              🚌
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#061a33] bg-emerald-400" />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                AJU Smart Bus
              </h1>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Student Portal
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
          >
            <span>Logout</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <div className="mx-auto max-w-[1550px] px-5 py-7 sm:px-8 lg:py-10">

        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#003b78] via-[#006ac7] to-[#00a8df] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-10 lg:p-12">

          {/* Decorative glow */}
          <div className="absolute -right-24 -top-28 h-[380px] w-[380px] rounded-full bg-cyan-300/20 blur-[90px]" />
          <div className="absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-blue-300/20 blur-[100px]" />
          <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-white/10 blur-[80px]" />

          {/* Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wider backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" />
                LIVE TRANSPORT SYSTEM
              </div>

              <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Welcome back
                <span className="ml-2 inline-block animate-float">👋</span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Track your university buses in real time, monitor live GPS
                locations and stay updated with the latest transportation
                information.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-lg font-black backdrop-blur-xl">
                  {firstLetter}
                </div>

                <div>
                  <p className="text-xs text-blue-200">
                    Currently signed in as
                  </p>
                  <p className="mt-0.5 font-bold text-white">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS CARD */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl lg:min-w-[280px]">

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-100">
                    System Status
                  </p>

                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-200">
                    ONLINE
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl">
                    📡
                  </div>

                  <div>
                    <p className="text-xl font-black">
                      GPS Connected
                    </p>

                    <p className="mt-1 text-xs text-blue-100">
                      Real-time updates enabled
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full animate-pulse rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Active buses */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🚌
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-600">
                LIVE
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Active Buses
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">
              {loading ? "—" : locations.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Currently transmitting GPS
            </p>
          </div>

          {/* GPS */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                📍
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-600">
                ACTIVE
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              GPS Tracking
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">
              LIVE
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Location services connected
            </p>
          </div>

          {/* Map */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                🗺️
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black tracking-wider text-blue-600">
                MAP
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Live Map
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">
              ON
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Interactive tracking available
            </p>
          </div>

          {/* System */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-500/5 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                ⚡
              </div>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black tracking-wider text-orange-600">
                REALTIME
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              System Status
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">
              OK
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All tracking services operational
            </p>
          </div>
        </section>

        {/* ================= MAP ================= */}
        <section className="mt-7 overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-xl">

          <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-3xl shadow-inner">
                🗺️
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">
                    Live Bus Map
                  </h3>

                  <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-600 sm:block">
                    REALTIME
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor university buses and their current locations.
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.6)]" />
              GPS Live
            </div>
          </div>

          <div className="bg-slate-50 p-4 sm:p-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-2xl">
              <StudentLiveMap locations={locations} />
            </div>
          </div>
        </section>

        {/* ================= FLEET ================= */}
        <section className="mt-10">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
                Fleet Overview
              </p>

              <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Live Buses
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Currently active university buses and their live information.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              {locations.length} Active
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                    <div className="flex-1">
                      <div className="h-5 w-36 rounded bg-slate-200" />
                      <div className="mt-3 h-4 w-28 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="h-16 rounded-2xl bg-slate-100" />
                    <div className="h-20 rounded-2xl bg-slate-100" />
                  </div>

                  <div className="mt-6 h-12 rounded-2xl bg-slate-200" />
                </div>
              ))}

            </div>

          ) : locations.length === 0 ? (

            /* NO BUSES */
            <div className="relative overflow-hidden rounded-[32px] border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">

              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-50 to-cyan-50 text-5xl shadow-inner">
                🚌
              </div>

              <h3 className="relative mt-7 text-2xl font-black text-slate-800">
                No buses are live right now
              </h3>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                Buses will automatically appear here when drivers start their
                GPS tracking.
              </p>

              <div className="relative mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Waiting for GPS connection
              </div>
            </div>

          ) : (

            /* BUS CARDS */
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {locations.map((location) => (

                <div
                  key={location.id}
                  className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-2xl sm:p-7"
                >

                  {/* Top line */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />

                  {/* Glow */}
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-all duration-500 group-hover:bg-blue-500/10" />

                  {/* HEADER */}
                  <div className="relative flex items-start justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-105">
                        🚌
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-black text-slate-900">
                            {location.bus?.bus_number ?? "AJU Bus"}
                          </h4>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Driver:{" "}
                          <span className="font-bold text-slate-700">
                            {location.bus?.driver_name ?? "Driver"}
                          </span>
                        </p>
                      </div>

                    </div>

                    <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      LIVE
                    </span>

                  </div>

                  {/* ROUTE */}
                  <div className="relative mt-7 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4">

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Current Route
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                        🛣️
                      </div>

                      <p className="font-black text-slate-800">
                        {location.bus?.route ?? "AJU Route"}
                      </p>
                    </div>

                  </div>

                  {/* LOCATION */}
                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-100">
                      <p className="text-[10px] font-black tracking-wider text-slate-400">
                        LATITUDE
                      </p>

                      <p className="mt-2 truncate font-mono text-sm font-bold text-slate-800">
                        {location.latitude.toFixed(6)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-100">
                      <p className="text-[10px] font-black tracking-wider text-slate-400">
                        LONGITUDE
                      </p>

                      <p className="mt-2 truncate font-mono text-sm font-bold text-slate-800">
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>

                  </div>

                  {/* UPDATED */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        🕐
                      </span>
                      <span>Last updated</span>
                    </div>

                    <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                      {new Date(
                        location.updated_at
                      ).toLocaleTimeString()}
                    </span>

                  </div>

                  {/* MAP BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                        "_blank"
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#005BAC] to-[#0878d1] py-4 font-black text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <span>📍</span>
                    View Live Location
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-14 border-t border-slate-200 py-8 text-center">

          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-600">
              GPS Tracking System Online
            </span>
          </div>

          <p className="text-sm font-black text-slate-700">
            AJU Smart Bus
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Real-time University Bus Tracking System
          </p>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            Smart • Connected • Real-Time
          </p>

        </footer>

      </div>
    </main>
  );
}