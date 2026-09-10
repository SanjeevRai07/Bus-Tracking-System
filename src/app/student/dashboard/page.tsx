"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LiveMap from "@/components/maps/LiveMap";

type Bus = {
  id: string;
  bus_number: string;
  driver_id: string | null;
  route_id: string | null;
  capacity: number | null;
  status: string | null;
};

type Driver = {
  id: string;
  full_name: string;
  phone: string | null;
};

type RouteItem = {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
};

type LiveLocation = {
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
};

type LiveBus = {
  id: string;
  bus_number: string;
  latitude: number;
  longitude: number;
  driverName: string | null;
  driverPhone: string | null;
  routeName: string | null;
  startPoint: string | null;
  endPoint: string | null;
  capacity: number | null;
  status: string | null;
  updated_at: string;
};

const LIVE_TIMEOUT_MS = 5 * 60 * 1000;

function isLive(updatedAt: string) {
  const timestamp = new Date(updatedAt).getTime();

  return (
    Number.isFinite(timestamp) &&
    Date.now() - timestamp <= LIVE_TIMEOUT_MS
  );
}

export default function StudentDashboard() {
  const router = useRouter();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [locations, setLocations] = useState<LiveLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const requestInFlightRef = useRef(false);

  async function loadData() {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;

    try {
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/student/login");
        return;
      }

      const [
        busesResult,
        driversResult,
        routesResult,
        locationsResult,
      ] = await Promise.all([
        supabase
          .from("buses")
          .select(
            "id,bus_number,driver_id,route_id,capacity,status"
          )
          .order("bus_number", {
            ascending: true,
          }),

        supabase
          .from("drivers")
          .select("id,full_name,phone")
          .order("full_name", {
            ascending: true,
          }),

        supabase
          .from("routes")
          .select(
            "id,route_name,start_point,end_point"
          )
          .order("route_name", {
            ascending: true,
          }),

        supabase
          .from("live_locations")
          .select(
            "bus_id,latitude,longitude,updated_at"
          ),
      ]);

      if (busesResult.error) {
        throw busesResult.error;
      }

      if (driversResult.error) {
        throw driversResult.error;
      }

      if (routesResult.error) {
        throw routesResult.error;
      }

      if (locationsResult.error) {
        throw locationsResult.error;
      }

      setBuses(
        (busesResult.data ?? []) as Bus[]
      );

      setDrivers(
        (driversResult.data ?? []) as Driver[]
      );

      setRoutes(
        (routesResult.data ?? []) as RouteItem[]
      );

      setLocations(
        (locationsResult.data ?? []) as LiveLocation[]
      );
    } catch (err) {
      console.error(
        "Student dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bus information."
      );
    } finally {
      requestInFlightRef.current = false;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);

      await loadData();

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const pollTimer = window.setInterval(() => {
      loadData();
    }, 2000);

    return () => {
      mounted = false;
      window.clearInterval(pollTimer);
    };
  }, []);

  // ============================================================
  // REALTIME LIVE LOCATION
  // ============================================================

  useEffect(() => {
    const channel = supabase
      .channel("student-live-buses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        (payload) => {
          const newRow =
            payload.new as Partial<LiveLocation>;

          const oldRow =
            payload.old as Partial<LiveLocation>;

          const busId =
            newRow.bus_id ||
            oldRow.bus_id;

          if (!busId) {
            return;
          }

          if (
            payload.eventType ===
            "DELETE"
          ) {
            setLocations((current) =>
              current.filter(
                (item) =>
                  item.bus_id !== busId
              )
            );

            return;
          }

          if (
            newRow.latitude ===
              undefined ||
            newRow.longitude ===
              undefined ||
            !newRow.updated_at
          ) {
            return;
          }

          const updatedLocation: LiveLocation = {
            bus_id: busId,
            latitude: Number(
              newRow.latitude
            ),
            longitude: Number(
              newRow.longitude
            ),
            updated_at:
              newRow.updated_at,
          };

          setLocations((current) => {
            const index =
              current.findIndex(
                (item) =>
                  item.bus_id === busId
              );

            if (index === -1) {
              return [
                ...current,
                updatedLocation,
              ];
            }

            return current.map(
              (item, itemIndex) =>
                itemIndex === index
                  ? updatedLocation
                  : item
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ============================================================
  // MAP DATA
  // ============================================================

  const liveLocations = useMemo(() => {
    return locations.filter((location) =>
      isLive(location.updated_at)
    );
  }, [locations]);

  /*
   * IMPORTANT:
   * live_locations is the source of truth for GPS.
   * A bus does not disappear just because metadata is unavailable.
   */
  const liveBuses: LiveBus[] = useMemo(() => {
    const driversMap = new Map(
      drivers.map((driver) => [
        driver.id,
        driver,
      ])
    );

    const routesMap = new Map(
      routes.map((route) => [
        route.id,
        route,
      ])
    );

    return liveLocations.map((location) => {
      const bus = buses.find(
        (item) => item.id === location.bus_id
      );

      const driver = bus?.driver_id
        ? driversMap.get(bus.driver_id)
        : undefined;

      const route = bus?.route_id
        ? routesMap.get(bus.route_id)
        : undefined;

      return {
        id: location.bus_id,
        bus_number:
          bus?.bus_number ||
          `BUS ${location.bus_id.slice(0, 8)}`,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        driverName:
          driver?.full_name ?? null,
        driverPhone:
          driver?.phone ?? null,
        routeName:
          route?.route_name ?? null,
        startPoint:
          route?.start_point ?? null,
        endPoint:
          route?.end_point ?? null,
        capacity:
          bus?.capacity ?? null,
        status:
          bus?.status ?? null,
        updated_at:
          location.updated_at,
      };
    });
  }, [
    liveLocations,
    buses,
    drivers,
    routes,
  ]);

  async function handleRefresh() {
    setRefreshing(true);

    await loadData();

    setRefreshing(false);
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "Student logout error:",
        err
      );
    } finally {
      window.location.replace("/");
    }
  }

  function formatTime(
    value: string
  ) {
    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown";
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-lg">
          <div className="text-5xl">
            🚌
          </div>

          <h1 className="mt-4 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Loading bus information...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🚌
            </div>

            <div>
              <p className="text-xs font-black tracking-widest text-[#005BAC]">
                AJU SMART BUS
              </p>

              <h1 className="text-lg font-black text-slate-900">
                Student Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* WELCOME */}

        <section className="rounded-3xl bg-gradient-to-r from-[#005BAC] to-[#0074D9] p-7 text-white shadow-lg">
          <p className="text-sm font-semibold text-blue-100">
            Welcome to
          </p>

          <h2 className="mt-1 text-3xl font-black">
            AJU Smart Bus Tracking
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Track university buses in real time and check their assigned routes and drivers.
          </p>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-black text-red-700">
              Unable to load data
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              🚌
            </div>

            <p className="mt-4 text-sm font-bold text-slate-400">
              Total Buses
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {buses.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              📍
            </div>

            <p className="mt-4 text-sm font-bold text-slate-400">
              Live Buses
            </p>

            <p className="mt-1 text-3xl font-black text-green-600">
              {liveBuses.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              🛣️
            </div>

            <p className="mt-4 text-sm font-bold text-slate-400">
              Available Routes
            </p>

            <p className="mt-1 text-3xl font-black text-[#005BAC]">
              {routes.length}
            </p>
          </div>
        </div>

        {/* LIVE MAP */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">
                  Live Bus Map
                </h2>

                <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  LIVE
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Bus locations update automatically when drivers share GPS.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-[#005BAC]">
              {liveBuses.length} live
            </div>
          </div>

          <LiveMap
            buses={liveBuses.map((bus) => ({
              id: bus.id,
              busNumber: bus.bus_number,
              latitude: bus.latitude,
              longitude: bus.longitude,
              driverName: bus.driverName,
              routeName: bus.routeName,
              updatedAt: bus.updated_at,
            }))}
            heightClassName="h-[620px]"
          />
        </section>

        {/* LIVE BUS CARDS */}

        <section className="mt-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">
              Live Buses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current buses being tracked by drivers.
            </p>
          </div>

          {liveBuses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">
                🚌
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-800">
                No bus is currently live
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Live bus locations will appear here when a driver starts GPS tracking.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {liveBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Bus
                      </p>

                      <h3 className="mt-1 text-3xl font-black text-[#005BAC]">
                        {bus.bus_number}
                      </h3>
                    </div>

                    <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      LIVE
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-400">
                        Driver
                      </p>

                      <p className="mt-1 font-black text-slate-800">
                        {bus.driverName ||
                          "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-400">
                        Route
                      </p>

                      <p className="mt-1 font-black text-slate-800">
                        {bus.routeName ||
                          "Not assigned"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-400">
                          From
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {bus.startPoint ||
                            "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-400">
                          To
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {bus.endPoint ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs font-bold text-green-600">
                        Last GPS Update
                      </p>

                      <p className="mt-1 text-sm font-black text-green-700">
                        {formatTime(
                          bus.updated_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ALL ROUTES */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">
              University Routes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Routes created by the Admin.
            </p>
          </div>

          {routes.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-500">
                No routes available.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                      🛣️
                    </div>

                    <div>
                      <h3 className="font-black text-slate-800">
                        {route.route_name}
                      </h3>

                      <p className="text-xs font-semibold text-slate-400">
                        University Bus Route
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-bold text-slate-400">
                        START
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {route.start_point}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-bold text-slate-400">
                        END
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {route.end_point}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}