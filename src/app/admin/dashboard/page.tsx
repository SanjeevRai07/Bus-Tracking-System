"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LiveMap, { type LiveMapBus } from "@/components/maps/LiveMap";

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
};

type RouteItem = {
  id: string;
  route_name: string;
};

type LiveLocation = {
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
};

type LiveBus = LiveMapBus;

const LIVE_TIMEOUT_MS = 5 * 60 * 1000;

function isLocationLive(updatedAt: string, now: number) {
  const timestamp = new Date(updatedAt).getTime();
  return Number.isFinite(timestamp) && now - timestamp <= LIVE_TIMEOUT_MS;
}

type Stats = {
  totalBuses: number;
  activeBuses: number;
  totalDrivers: number;
  totalRoutes: number;
  liveBuses: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [locations, setLocations] = useState<LiveLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const requestInFlightRef = useRef(false);

  async function loadDashboardData() {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;

    try {
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Authentication check failed: ${sessionError.message}`
        );
      }

      if (!session?.user) {
        router.replace("/admin/login");
        return;
      }

      /*
       * Buses + live_locations are the critical tracking path.
       * Driver and route metadata are optional and must never
       * prevent a live bus from appearing on the map.
       */
      const [
        busesResult,
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
          .from("live_locations")
          .select(
            "bus_id,latitude,longitude,updated_at"
          ),
      ]);

      if (locationsResult.error) {
        throw new Error(
          `Live locations query failed: ${locationsResult.error.message}`
        );
      }

      /*
       * Tracking MUST continue even if the bus metadata query
       * fails. An error here must not hide GPS locations.
       */
      if (busesResult.error) {
        console.warn(
          "Buses query failed; showing live GPS without metadata:",
          busesResult.error
        );

        setBuses([]);
      } else {
        setBuses(
          (busesResult.data ?? []) as Bus[]
        );
      }

      /*
       * Load driver + route metadata separately.
       * These are enrichment only.
       */
      const [
        driversResult,
        routesResult,
      ] = await Promise.all([
        supabase
          .from("drivers")
          .select("id,full_name")
          .order("full_name", {
            ascending: true,
          }),

        supabase
          .from("routes")
          .select("id,route_name")
          .order("route_name", {
            ascending: true,
          }),
      ]);

      setDrivers(
        driversResult.error
          ? []
          : ((driversResult.data ?? []) as Driver[])
      );

      setRoutes(
        routesResult.error
          ? []
          : ((routesResult.data ?? []) as RouteItem[])
      );

      setLocations(
        (locationsResult.data ?? []) as LiveLocation[]
      );
    } catch (err: any) {
      console.error("Admin dashboard error:", err);

      const message =
        err?.message ||
        err?.error_description ||
        err?.details ||
        err?.hint ||
        (typeof err === "string" ? err : "Unknown dashboard error");

      setError(String(message));
    } finally {
      requestInFlightRef.current = false;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);
      await loadDashboardData();

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setNow(Date.now());
    }, 5000);

    const pollTimer = window.setInterval(() => {
      loadDashboardData();
    }, 2000);

    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(pollTimer);
    };
  }, []);

  useEffect(() => {
    const busesChannel = supabase
      .channel("admin-dashboard-buses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "buses",
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const locationsChannel = supabase
      .channel("admin-dashboard-live-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        (payload) => {
          const newRow = payload.new as Partial<LiveLocation>;
          const oldRow = payload.old as Partial<LiveLocation>;

          const busId = newRow.bus_id || oldRow.bus_id;

          if (!busId) return;

          if (payload.eventType === "DELETE") {
            setLocations((current) =>
              current.filter((item) => item.bus_id !== busId)
            );
            return;
          }

          if (
            newRow.latitude === undefined ||
            newRow.longitude === undefined ||
            !newRow.updated_at
          ) {
            return;
          }

          const nextLocation: LiveLocation = {
            bus_id: busId,
            latitude: Number(newRow.latitude),
            longitude: Number(newRow.longitude),
            updated_at: newRow.updated_at,
          };

          setLocations((current) => {
            const index = current.findIndex(
              (item) => item.bus_id === busId
            );

            if (index === -1) {
              return [...current, nextLocation];
            }

            return current.map((item, itemIndex) =>
              itemIndex === index ? nextLocation : item
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(busesChannel);
      supabase.removeChannel(locationsChannel);
    };
  }, []);

  const driversMap = useMemo(() => {
    return new Map(drivers.map((driver) => [driver.id, driver]));
  }, [drivers]);

  const routesMap = useMemo(() => {
    return new Map(routes.map((route) => [route.id, route]));
  }, [routes]);

  const locationsMap = useMemo(() => {
    return new Map(
      locations.map((location) => [location.bus_id, location])
    );
  }, [locations]);

  const liveLocations = useMemo(() => {
    return locations.filter((location) =>
      isLocationLive(location.updated_at, now)
    );
  }, [locations, now]);

  const stats: Stats = useMemo(() => {
    const activeBuses = buses.filter((bus) => {
      const status = (bus.status ?? "").toLowerCase();

      return (
        status === "active" ||
        status === "running" ||
        status === "available"
      );
    }).length;

    return {
      totalBuses: buses.length,
      activeBuses,
      totalDrivers: drivers.length,
      totalRoutes: routes.length,
      liveBuses: liveLocations.length,
    };
  }, [
    buses,
    drivers,
    routes,
    liveLocations,
  ]);

  /*
   * IMPORTANT:
   * live_locations is the source of truth for tracking.
   * We do NOT require a buses.id match for the marker to appear.
   * Bus/driver/route data is optional enrichment only.
   */
  const liveBuses: LiveBus[] = useMemo(() => {
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
        busNumber:
          bus?.bus_number ||
          `BUS ${location.bus_id.slice(0, 8)}`,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        driverName:
          driver?.full_name ?? null,
        routeName:
          route?.route_name ?? null,
        updatedAt:
          location.updated_at,
      };
    });
  }, [
    liveLocations,
    buses,
    driversMap,
    routesMap,
  ]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }

  function getStatusClass(status: string | null) {
    const value = (status ?? "").toLowerCase();

    if (
      value === "active" ||
      value === "running" ||
      value === "available"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      value === "inactive" ||
      value === "offline" ||
      value === "maintenance"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-lg">
          <div className="text-5xl">🚌</div>

          <h1 className="mt-4 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black text-[#005BAC]">
              AJU SMART BUS
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900 md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Manage and monitor the complete university bus system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
              System Online
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🚌
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#005BAC]">
                Fleet
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Total Buses
            </p>

            <p className="mt-1 text-4xl font-black text-slate-900">
              {stats.totalBuses}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                ✅
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Active
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Active Buses
            </p>

            <p className="mt-1 text-4xl font-black text-green-600">
              {stats.activeBuses}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                👨‍✈️
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                Drivers
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Total Drivers
            </p>

            <p className="mt-1 text-4xl font-black text-slate-900">
              {stats.totalDrivers}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                🛣️
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                Routes
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Total Routes
            </p>

            <p className="mt-1 text-4xl font-black text-slate-900">
              {stats.totalRoutes}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                📍
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                LIVE
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-400">
              Live Buses
            </p>

            <p className="mt-1 text-4xl font-black text-emerald-600">
              {stats.liveBuses}
            </p>
          </div>
        </div>

        {/* LIVE MAP */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">
                  Live Bus Tracking
                </h2>

                <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  REAL-TIME
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Driver GPS positions are displayed here automatically.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-[#005BAC]">
              {liveBuses.length}{" "}
              {liveBuses.length === 1 ? "bus" : "buses"} live
            </div>
          </div>

          <LiveMap buses={liveBuses} heightClassName="h-[620px]" />
        </section>

        {/* BUS TABLE */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Bus Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Bus, driver and route assignments are controlled by Admin.
            </p>
          </div>

          {buses.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-6 py-12 text-center">
              <div className="text-5xl">🚌</div>

              <h3 className="mt-4 font-black text-slate-800">
                No buses found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add a bus from Admin → Buses.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Bus
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Driver
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Route
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Capacity
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      GPS
                    </th>

                    <th className="px-3 pb-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Updated
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {buses.map((bus) => {
                    const driver = bus.driver_id
                      ? driversMap.get(bus.driver_id)
                      : undefined;

                    const route = bus.route_id
                      ? routesMap.get(bus.route_id)
                      : undefined;

                    const location = locationsMap.get(
                      bus.id
                    );

                    const locationLive = Boolean(
                      location &&
                      isLocationLive(location.updated_at, now)
                    );

                    return (
                      <tr
                        key={bus.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4">
                          <span className="font-black text-[#005BAC]">
                            {bus.bus_number}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-slate-700">
                          {driver?.full_name || "Not assigned"}
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-slate-700">
                          {route?.route_name || "Not assigned"}
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-slate-600">
                          {bus.capacity ?? "—"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                              bus.status
                            )}`}
                          >
                            {bus.status || "Unknown"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                              locationLive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                location
                                  ? "animate-pulse bg-green-500"
                                  : "bg-slate-300"
                              }`}
                            />

                            {locationLive ? "LIVE" : "OFFLINE"}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-xs font-medium text-slate-500">
                          {location
                            ? `${formatTime(location.updated_at)}${locationLive ? "" : " (stale)"}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}