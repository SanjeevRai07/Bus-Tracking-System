"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const StudentLiveMap = dynamic(
  () => import("./StudentLiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl bg-slate-100">
        <p className="font-semibold text-[#005BAC]">
          Loading live map...
        </p>
      </div>
    ),
  }
);

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
        bus: Array.isArray(item.buses)
          ? item.buses[0]
          : item.buses,
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

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="bg-[#005BAC] px-6 py-5 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              AJU Smart Bus
            </h1>

            <p className="text-sm text-blue-100">
              Student Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-[#005BAC] transition hover:bg-blue-50"
          >
            Logout
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* WELCOME */}
        <section className="rounded-2xl bg-white p-7 shadow-sm">

          <p className="text-sm font-semibold text-[#005BAC]">
            STUDENT ACCOUNT
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Welcome 👋
          </h2>

          <p className="mt-2 text-slate-500">
            {email}
          </p>

        </section>

        {/* LIVE STATUS */}
        <section className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

          <div>
            <h3 className="text-xl font-bold text-slate-800">
              🚌 Live Bus Tracking
            </h3>

            <p className="mt-1 text-slate-500">
              See currently active university buses.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full bg-green-100 px-5 py-2 font-semibold text-green-700">

            <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

            GPS Live

          </div>

        </section>

        {/* =========================================
            LIVE MAP
        ========================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="text-2xl font-bold text-[#005BAC]">
                🗺️ Live Bus Map
              </h3>

              <p className="mt-1 text-slate-500">
                Track university buses in real time.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">

              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

              GPS Live

            </div>

          </div>

          <StudentLiveMap locations={locations} />

        </section>

        {/* =========================================
            AVAILABLE BUSES
        ========================================== */}

        <section className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-2xl font-bold text-[#005BAC]">
              Available Buses
            </h3>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#005BAC]">
              {locations.length} Live
            </span>

          </div>

          {/* LOADING */}
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <p className="font-semibold text-[#005BAC]">
                Loading live buses...
              </p>

            </div>

          ) : locations.length === 0 ? (

            /* NO BUSES */
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                🚌
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-700">
                No buses are currently live
              </h3>

              <p className="mt-2 text-slate-500">
                Drivers will appear here when they start GPS.
              </p>

            </div>

          ) : (

            /* BUS CARDS */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {locations.map((location) => (

                <div
                  key={location.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  {/* BUS HEADER */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                        🚌
                      </div>

                      <div>

                        <h4 className="text-xl font-bold text-[#005BAC]">
                          {location.bus?.bus_number ?? "AJU Bus"}
                        </h4>

                        <p className="text-slate-500">
                          {location.bus?.driver_name ?? "Driver"}
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      ● Live
                    </span>

                  </div>

                  {/* BUS DETAILS */}
                  <div className="mt-6 space-y-3">

                    <div className="flex justify-between border-b pb-3">

                      <span className="text-slate-500">
                        Route
                      </span>

                      <span className="font-semibold text-slate-700">
                        {location.bus?.route ?? "AJU Route"}
                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-3">

                      <span className="text-slate-500">
                        Latitude
                      </span>

                      <span className="font-mono text-sm font-semibold">
                        {location.latitude.toFixed(6)}
                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-3">

                      <span className="text-slate-500">
                        Longitude
                      </span>

                      <span className="font-mono text-sm font-semibold">
                        {location.longitude.toFixed(6)}
                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-500">
                        Last Updated
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {new Date(
                          location.updated_at
                        ).toLocaleTimeString()}
                      </span>

                    </div>

                  </div>

                  {/* GOOGLE MAP */}
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                        "_blank"
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-[#005BAC] py-3 font-bold text-white transition hover:bg-blue-700"
                  >
                    📍 View Bus Location
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}